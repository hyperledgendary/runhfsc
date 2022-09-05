/*
 * SPDX-License-Identifier: Apache-2.0
 */

import pino from 'pino';

export const logger = pino(
    {
        level: 'debug',
    },
    pino.destination(process.env.RUNHFSC_LOG || './runhfsc.log'),
);
