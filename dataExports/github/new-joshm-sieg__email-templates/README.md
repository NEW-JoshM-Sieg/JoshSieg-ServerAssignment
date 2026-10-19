# email-templates

HTML email templates for **Riverstone Coffee Roasters**:

- `order-confirmation.html`: sent after every storefront order
- `launch-announcement.html`: storefront and Holiday Blend launch email for **November 10**

Placeholders use `{{double_braces}}` and are filled in by the storefront's mailer.

## How to preview

Open the HTML files in a browser, or run:

```bash
npx serve .
```

Keep layouts table-based and styles inline so they render in Gmail and Outlook.

## Who is involved

- **Priya Raman**: header art and layout
- **Marcus Lee**: hooks the templates into the storefront mailer
- **Dana Whitfield**: proofreads and sends the launch announcement (retail list + wholesale accounts like Corner Table Cafe)
