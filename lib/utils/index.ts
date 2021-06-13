import { RedisError, TIMEOUT_EXCEEDED } from '../errors';

/**
 * Executes promise in the given timeout. If the promise does not finish in the given timeout, it will reject.
 *
 * @param ms - The timeout in milliseconds
 * @param promise - The promise that needs to execute
 */
export const promiseTimeout = (ms: number, promise: Promise<unknown>): Promise<unknown> => {
    const timeout = new Promise((_, reject) => {
        const id = setTimeout(() => {
            clearTimeout(id);
            reject(new RedisError(TIMEOUT_EXCEEDED(ms)));
        }, ms);
    });

    return Promise.race([timeout, promise]);
};

/**
 * Uses for the test.
 */
export const testConfig = {
    host: process.env.REDIS_HOST as string,
    port: Number.parseInt(process.env.REDIS_PORT as string, 10),
    password: process.env.REDIS_PASSWORD as string
};
