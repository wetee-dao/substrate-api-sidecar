#!/bin/sh

# 来源于网络，用于获取当前shell文件的路径
SOURCE="$0"
while [ -h "$SOURCE"  ]; do # resolve $SOURCE until the file is no longer a symlink
    DIR="$( cd -P "$( dirname "$SOURCE"  )" && pwd  )"
    SOURCE="$(readlink "$SOURCE")"
    [[ $SOURCE != /*  ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE"  )" && pwd  )"

cd "$DIR/../"

export SAS_SUBSTRATE_URL="wss://xiaobai.asyou.me:30011/ws"
yarn build
yarn start