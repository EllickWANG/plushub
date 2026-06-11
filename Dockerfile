FROM registry.cn-hangzhou.aliyuncs.com/ellicksy/public:oven_bun_1_sha256_0733e5032507 AS builder


WORKDIR /build
COPY web/package.json .
COPY web/bun.lock .
RUN bun install
COPY ./web .
COPY ./VERSION .
RUN DISABLE_ESLINT_PLUGIN='true' VITE_REACT_APP_VERSION=$(cat VERSION) bun run build

FROM registry.cn-hangzhou.aliyuncs.com/ellicksy/public:golang_1.26.1-alpine_sha256_2389ebfa5b7f AS builder2
ENV GO111MODULE=on CGO_ENABLED=0

ARG TARGETOS
ARG TARGETARCH
ENV GOOS=${TARGETOS:-linux} GOARCH=${TARGETARCH:-amd64}
ENV GOEXPERIMENT=greenteagc

WORKDIR /build

ADD go.mod go.sum ./
RUN go mod download

COPY . .
COPY --from=builder /build/dist ./web/dist
RUN go build -ldflags "-s -w -X 'github.com/QuantumNous/new-api/common.Version=$(cat VERSION)'" -o new-api

FROM registry.cn-hangzhou.aliyuncs.com/ellicksy/public:debian_bookworm-slim_sha256_f06537653ac7

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates tzdata libasan8 wget \
    && rm -rf /var/lib/apt/lists/* \
    && update-ca-certificates

COPY --from=builder2 /build/new-api /
EXPOSE 17821
WORKDIR /data
ENTRYPOINT ["/new-api"]
