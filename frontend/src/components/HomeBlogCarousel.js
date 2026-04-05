import React, { useEffect, useState } from 'react';
import * as blogApi from '../api/blogs';
import './HomeBlogCarousel.css';

const HomeBlogCarousel = () => {
  const [blogs, setBlogs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dragStartX, setDragStartX] = useState(null);
  const [dragTranslate, setDragTranslate] = useState(0);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await blogApi.getAllBlogs({ limit: 6 });
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

  const next = () => {
    if (!blogs.length) return;
    setActiveIndex((prev) => (prev + 1) % blogs.length);
  };

  const prev = () => {
    if (!blogs.length) return;
    setActiveIndex((prev) => (prev - 1 + blogs.length) % blogs.length);
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
    const threshold = 80;
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
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
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

  if (loading || !blogs.length) return null;

  return (
    <section className="home-blog-section">
      <div className="home-blog-header">
        <span className="home-blog-label">BLOG</span>
        <h2 className="home-blog-title">News &amp; Updates</h2>
      </div>

      <div className="home-blog-carousel">
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
              transform: `translateX(calc(-${activeIndex * 80}% + ${dragTranslate}px))`,
            }}
          >
            {blogs.map((blog, index) => {
              const prevIndex = (activeIndex - 1 + blogs.length) % blogs.length;
              const nextIndex = (activeIndex + 1) % blogs.length;

              const slideClass = [
                'blog-slide',
                index === activeIndex ? 'active' : '',
                index === prevIndex ? 'prev' : '',
                index === nextIndex ? 'next' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <div key={blog._id} className={slideClass}>
                  <div className="blog-card">
                    <div className="blog-main">
                      <div className="blog-media">
                        {blog.coverImage && (
                          <div className="blog-cover">
                            <img
                              src={getImageUrl(blog.coverImage)}
                              alt={blog.title}
                            />
                          </div>
                        )}

                        {(blog.category || (blog.tags && blog.tags.length > 0)) && (
                          <div className="blog-meta-under-image">
                            {blog.category && (
                              <div className="blog-category">{blog.category}</div>
                            )}

                            {blog.tags && blog.tags.length > 0 && (
                              <div className="blog-tags">
                                {blog.tags.slice(0, 4).map((tag, i) => (
                                  <span key={i}>{tag}</span>
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
              );
            })}
          </div>
        </div>

      </div>

      <div className="blog-dots">
        {blogs.map((_, i) => (
          <button
            key={i}
            className={`blog-dot ${i === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HomeBlogCarousel;

