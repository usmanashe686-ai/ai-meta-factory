# Monitoring & Alerting Setup

This directory contains configuration for Prometheus alert rules and Alertmanager.

## Prometheus

- Add `alerts.yml` to your Prometheus config under `rule_files`.
- Ensure your Prometheus targets expose metrics (e.g., API gateway `/metrics` endpoint).
- The metrics we expect:
  - `http_request_duration_ms` (histogram)
  - `http_requests_total` (counter)
  - `bull_queue_size` (gauge)
  - `bull_job_failed_total` (counter)
  - `ai_request_duration_ms` (histogram)
  - `up` (from Prometheus itself)

## Alertmanager

- Edit `config.yml` with your actual SMTP and Slack settings.
- Mount this file into your Alertmanager container.

## Example Docker Compose snippet

```yaml
prometheus:
  image: prom/prometheus:latest
  volumes:
    - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
    - ./prometheus/alerts.yml:/etc/prometheus/alerts.yml
  ports:
    - "9090:9090"

alertmanager:
  image: prom/alertmanager:latest
  volumes:
    - ./alertmanager/config.yml:/etc/alertmanager/config.yml
  ports:
    - "9093:9093"
