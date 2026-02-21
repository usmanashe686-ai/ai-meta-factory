# Alerting System with PagerDuty

This guide explains how to integrate PagerDuty with your Prometheus Alertmanager to receive critical alerts via phone, SMS, email, or push notifications.

## 1. Create a PagerDuty Service

1. Log in to your [PagerDuty account](https://www.pagerduty.com/).
2. Go to **Services** → **Service Directory** → **+ New Service**.
3. Give the service a name (e.g., "AI Meta Factory Production").
4. Choose an escalation policy (or create a new one).
5. For **Integration Type**, select **Prometheus** (or **Use our API directly** and later copy the integration key).
6. Click **Add Service**. After creation, you'll see an **Integration Key** (a 32‑character string). Copy it.

## 2. Configure Alertmanager

In your Alertmanager configuration file (e.g., `alertmanager.yml`), add a receiver for PagerDuty using the integration key.

Example `alertmanager.yml`:

```yaml
route:
  group_by: ['alertname', 'job']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'pagerduty-critical'
  routes:
  - match:
      severity: critical
    receiver: 'pagerduty-critical'
    continue: true
  - match:
      severity: warning
    receiver: 'slack-warning'

receivers:
- name: 'pagerduty-critical'
  pagerduty_configs:
  - service_key: <YOUR_INTEGRATION_KEY>
    send_resolved: true
    description: '{{ template "pagerduty.default.description" . }}'
    client: 'AI Meta Factory'
    client_url: 'https://your-frontend-url.com'

- name: 'slack-warning'
  slack_configs:
  - api_url: 'https://hooks.slack.com/services/...'
    channel: '#alerts'
    send_resolved: true
    title: '{{ .GroupLabels.alertname }}'
    text: '{{ range .Alerts }}{{ .Annotations.summary }}\n{{ .Annotations.description }}\n{{ end }}'
