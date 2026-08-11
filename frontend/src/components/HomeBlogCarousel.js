import React, { useEffect, useState } from 'react';
import * as blogApi from '../api/blogs';
import { resolveUploadUrl } from '../utils/resolveUploadUrl';
import './HomeBlogCarousel.css';

const HomeBlogCarousel = () => {
  const [blogs, setBlogs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dragStartX, setDragStartX] = useState(null);
  const [dragTranslate, setDragTranslate] = useState(0);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await blogApi.getAllBlogs({ limit: 12 });
        const list = res.data.data?.blogs || res.data.blogs || [];
        setBlogs(list);
      } catch (e) {
        console.error('Error fetching blogs for home carousel:', e);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const getCardsPerView = () => {
    if (windowWidth < 768) return 1;
    return 2;
  };

  const cardsPerView = getCardsPerView();

  // Duplicate blog items when list is small so cycling through cards works seamlessly
  const displayBlogs =
    blogs.length > 1 && blogs.length < 6 ? [...blogs, ...blogs] : blogs;

  const maxIndex = displayBlogs.length > cardsPerView ? displayBlogs.length - cardsPerView : 0;

  useEffect(() => {
    if (activeIndex > maxIndex && maxIndex >= 0) {
      setActiveIndex(maxIndex);
    }
  }, [maxIndex, activeIndex]);

  const next = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!displayBlogs.length) return;
    setActiveIndex((prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
  };

  const prev = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!displayBlogs.length) return;
    setActiveIndex((prevIndex) => (prevIndex <= 0 ? maxIndex : prevIndex - 1));
  };

  const handleDragStart = (clientX) => {
    setDragStartX(clientX);
  };

  const handleDragMove = (clientX) => {
    if (dragStartX === null) return;
    const delta = clientX - dragStartX;
    setDragTranslate(delta);
  };

  const handleDragEnd = () => {
    if (dragStartX === null) return;
    const threshold = 40;
    if (dragTranslate > threshold) {
      prev();
    } else if (dragTranslate < -threshold) {
      next();
    }
    setDragStartX(null);
    setDragTranslate(0);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return resolveUploadUrl(imagePath);
  };

  const getExcerptText = (blog) => {
    if (!blog) return '';
    if (blog.excerpt && blog.excerpt.trim()) {
      return blog.excerpt.trim();
    }
    return '';
  };

  const getContentFull = (blog) => {
    if (!blog || !blog.content) return '';
    const plain = blog.content.replace(/<[^>]*>/g, '').trim();
    return plain;
  };

  const getTransform = () => {
    if (cardsPerView === 2) {
      return `translateX(calc(-${activeIndex * 50}% - ${activeIndex * 12}px + ${dragTranslate}px))`;
    } else {
      return `translateX(calc(-${activeIndex * 100}% - ${activeIndex * 16}px + ${dragTranslate}px))`;
    }
  };

  if (loading || !blogs.length) return null;

  return (
    <section className="home-blog-section">
      <div className="home-blog-header">
        <span className="home-blog-label">BLOG</span>
        <h2 className="home-blog-title">News &amp; Updates</h2>
      </div>

      <div className="blog-carousel-container">
        {displayBlogs.length > cardsPerView && (
          <button
            type="button"
            className="carousel-nav-btn prev-btn"
            onClick={prev}
            aria-label="Previous blogs"
          >
            ‹
          </button>
        )}

        <div
          className={`blog-viewport ${dragStartX !== null ? 'dragging' : ''}`}
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseMove={(e) => handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
        >
          <div
            className={`blog-track ${dragStartX !== null ? 'dragging' : ''}`}
            style={{
              transform: getTransform(),
            }}
          >
            {displayBlogs.map((blog, index) => (
              <div key={`${blog._id}-${index}`} className="blog-slide">
                <div className="blog-card">
                  <div className="blog-main">
                    <div className="blog-media">
                      {blog.coverImage ? (
                        <div className="blog-cover">
                          <img
                            src={getImageUrl(blog.coverImage)}
                            alt={blog.title}
                            draggable={false}
                          />
                        </div>
                      ) : (
                        <div className="blog-cover blog-cover-placeholder">
                          <span>GDG</span>
                        </div>
                      )}

                      {(blog.category || (blog.tags && blog.tags.length > 0)) && (
                        <div className="blog-meta-under-image">
                          {blog.category && (
                            <div className="blog-category">{blog.category}</div>
                          )}

                          {blog.tags && blog.tags.length > 0 && (
                            <div className="blog-tags">
                              {blog.tags.slice(0, 3).map((tag, i) => (
                                <span key={i}>#{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="blog-content">
                      <h3 className="blog-title">{blog.title}</h3>

                      {getExcerptText(blog) && (
                        <p className="blog-excerpt">
                          {getExcerptText(blog)}
                        </p>
                      )}

                      {getContentFull(blog) && (
                        <p className="blog-content-body">
                          {getContentFull(blog)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {displayBlogs.length > cardsPerView && (
          <button
            type="button"
            className="carousel-nav-btn next-btn"
            onClick={next}
            aria-label="Next blogs"
          >
            ›
          </button>
        )}
      </div>

      {blogs.length > 1 && (
        <div className="blog-dots">
          {blogs.map((_, i) => (
            <button
              type="button"
              key={i}
              className={`blog-dot ${i === activeIndex % blogs.length ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(i);
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HomeBlogCarousel;
