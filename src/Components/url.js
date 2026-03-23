// API host only. This does not control frontend routing (admin/public pages).
const baseURL = (
	process.env.REACT_APP_API_BASE_URL ||
	process.env.REACT_APP_API_URL ||
	(typeof window !== 'undefined' ? window.location.origin : '')
).replace(/\/$/, '');

export default baseURL;

