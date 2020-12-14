#!/bin/bash
npx prisma generate
export NODE_ENV=prod; nohup node app-ntvi-cluster.js &> app.out &
