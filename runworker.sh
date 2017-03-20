#!/usr/bin/env bash
nohup python3 manage.py runworker -v2 &>/dev/null & echo $! > runworker.pid
