const refreshTokens = new Map();

const saveRefreshToken = (token, userId, expiresInDays = 365) => {
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + expiresInDays);
};
const getRefreshToken = () => {};


const deleteRefreshToken = () => {};
