export default {
 host: process.env.REDIS_HOST,
 port: process.env.REDIS_PORT,
 connectTimeout: 10000,
 health_check_interval:30,
};