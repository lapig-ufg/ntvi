export default {
 host: process.env.REDIS_HOST,
 port: process.env.REDIS_PORT,
 password: process.env.REDIS_PASSWORD,
 connectTimeout: 10000,
 health_check_interval:30,
};