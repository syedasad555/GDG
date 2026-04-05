import api from './axios';

export const getWeeklyLeaderboard = () => {
  return api.get('/leaderboard/weekly');
};

export const getMonthlyLeaderboard = () => {
  return api.get('/leaderboard/monthly');
};

export const getAllTimeLeaderboard = () => {
  return api.get('/leaderboard/all-time');
};

export const getUserRank = (userId, period) => {
  return api.get(`/leaderboard/user/${userId}/${period}`);
};

export const updateLeaderboard = () => {
  return api.post('/leaderboard/update');
};
