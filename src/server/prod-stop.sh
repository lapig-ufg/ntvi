#!/bin/bash
kill $(pgrep -f "node app-ntvi-cluster.js")
kill $(pgrep -f "query-engine-debian-openssl")