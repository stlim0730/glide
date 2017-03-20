#!/usr/bin/env bash
nohup daphne glide.asgi:channel_layer -p 8889 -b 0.0.0.0 -v2 &>/dev/null & echo $! > daphne.pid
