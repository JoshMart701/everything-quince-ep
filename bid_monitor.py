"""
Government Bid Monitor — El Paso, TX
=====================================
Monitors SAM.gov, Texas SmartBuy, and local El Paso portals
for new contract opportunities matching your service categories.

Sends a daily digest email with relevant opportunities.

SETUP (one time):
  pip install requests python-dotenv

Create a .env file in the same folder with:
  SAM_API_KEY=your_key_here        # Free at sam.gov/api
  EMAIL_FROM=you@gmail.com
  EMAIL_TO=you@gmail.com
  EMAIL_PASSWORD=your_app_password  # Gmail app password
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587

RUN MANUALLY:
  python bid_monitor.py

TO AUTOMATE (runs every morning at 7am):
  Mac/Linux — add to crontab:
    0 7 * * * /usr/bin/python3 /path/to/bid_monitor.py

  Windows — use Task Scheduler to run daily at 7am
"""

import os
import json
import smtplib
import requests
import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ─────────────────────────────────────────────
# YOUR CONFIGURATION — edit these
# ─────────────────────────────────────────────

# NAICS codes for your service categories
# 561730 = Landscaping Services
# 561720 = Janitorial Services
# 561210 = Facilities Support Services
# 561110 = Office Administrative Services
NAICS_CODES = ["561730", "561720", "561210", "561110"]

# Keywords to match in opportunity titles/descriptions
KEYWORDS = [
    "grounds maintenance", "landscaping", "lawn",
    "janitorial", "cleaning", "custodial",
    "facility maintenance", "facilities",
    "pest control", "building maintenance",
    "El Paso", "Fort Bliss"
]

# Dollar range you want to see (set max high to see everything)
MIN_VALUE = 2_000
MAX_VALUE = 500_000

# Load credentials from environment
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv optional, can set env vars manually

SAM_API_KEY    = os.getenv("SAM_API_KEY", "")
EMAIL_FROM     = os.getenv("EMAIL_FROM", "")
EMAIL_TO       = os.getenv("EMAIL_TO", "")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")
SMTP_HOST      = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT      = int(os.getenv("SMTP_PORT", 587))

# ─────────────────────────────────────────────
# SAM.GOV SEARCH
# ─────────────────────────────────────────────

def search_sam_gov():
    """Search SAM.gov for opportunities posted in the last 24 hours."""
    opportunities = []

    if not SAM_API_KEY:
        print("⚠ SAM_API_KEY not set — skipping SAM.gov search")
        print("  Get a free key at: https://open.gsa.gov/api/get-api-key/")
        return opportunities

    yesterday = (datetime.date.today() - datetime.timedelta(days=1)).strftime("%m/%d/%Y")
    today     = datetime.date.today().strftime("%m/%d/%Y")

    for naics in NAICS_CODES:
        try:
            url = "https://api.sam.gov/opportunities/v2/search"
            params = {
                "api_key":       SAM_API_KEY,
                "postedFrom":    yesterday,
                "postedTo":      today,
                "naicsCode":     naics,
                "ptype":         "o,k,r,s",   # solicitation types
                "limit":         25,
            }
            resp = requests.get(url, params=params, timeout=15)
            if resp.status_code == 200:
                data = resp.json()
                for opp in data.get("opportunitiesData", []):
                    title = opp.get("title", "")
                    desc  = opp.get("description", "")
                    # Score relevance by keyword matches
                    score = sum(1 for kw in KEYWORDS if kw.lower() in (title + desc).lower())
                    if score > 0:
                        opportunities.append({
                            "source":   "SAM.gov (Federal)",
                            "title":    title,
                            "agency":   opp.get("organizationName", "Unknown Agency"),
                            "naics":    naics,
                            "posted":   opp.get("postedDate", ""),
                            "deadline": opp.get("responseDeadLine", "TBD"),
                            "url":      f"https://sam.gov/opp/{opp.get('noticeId', '')}/view",
                            "score":    score,
                        })
            else:
                print(f"SAM.gov API error {resp.status_code} for NAICS {naics}")
        except Exception as e:
            print(f"SAM.gov error: {e}")

    return opportunities


# ─────────────────────────────────────────────
# TEXAS SMARTBUY SEARCH
# ─────────────────────────────────────────────

def search_texas_smartbuy():
    """
    Check Texas SmartBuy for recent solicitations.
    Texas uses ESBD (Electronic State Business Daily).
    Public feed: https://www.txsmartbuy.gov/esbd
    """
    opportunities = []
    try:
        # Texas ESBD RSS/JSON feed — open solicitations
        url = "https://www.txsmartbuy.gov/esbd/json"
        resp = requests.get(url, timeout=15)
        if resp.status_code == 200:
            items = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else []
            for item in items[:50]:  # check latest 50
                title = item.get("title", "") or item.get("Title", "")
                desc  = item.get("description", "") or item.get("Description", "")
                combined = (title + " " + desc).lower()
                score = sum(1 for kw in KEYWORDS if kw.lower() in combined)
                if score > 0:
                    opportunities.append({
                        "source":   "Texas SmartBuy (State)",
                        "title":    title,
                        "agency":   item.get("agency", "Texas Agency"),
                        "naics":    item.get("naics", ""),
                        "posted":   item.get("postDate", ""),
                        "deadline": item.get("closeDate", "TBD"),
                        "url":      item.get("url", "https://www.txsmartbuy.gov/esbd"),
                        "score":    score,
                    })
        else:
            # Fallback — return a reminder to check manually
            opportunities.append({
                "source":   "Texas SmartBuy (State)",
                "title":    "⚠ Manual check required — API unavailable",
                "agency":   "",
                "naics":    "",
                "posted":   str(datetime.date.today()),
                "deadline": "",
                "url":      "https://www.txsmartbuy.gov/esbd",
                "score":    0,
            })
    except Exception as e:
        print(f"Texas SmartBuy error: {e}")

    return opportunities


# ─────────────────────────────────────────────
# EL PASO LOCAL PORTALS
# ─────────────────────────────────────────────

def get_local_reminders():
    """
    City of El Paso and El Paso County don't have public JSON APIs,
    so this returns direct links to check manually — included in the
    daily email as quick-tap links.
    """
    return [
        {
            "source":   "City of El Paso",
            "title":    "Check City procurement portal for new bids",
            "agency":   "City of El Paso Purchasing",
            "naics":    "",
            "posted":   str(datetime.date.today()),
            "deadline": "",
            "url":      "https://procurement.elpasotexas.gov/web/login",
            "score":    0,
        },
        {
            "source":   "El Paso County",
            "title":    "Check County purchasing for new bids",
            "agency":   "El Paso County Purchasing",
            "naics":    "",
            "posted":   str(datetime.date.today()),
            "deadline": "",
            "url":      "https://www.epcounty.com/purchasing/",
            "score":    0,
        },
        {
            "source":   "Fort Bliss",
            "title":    "Check Fort Bliss Small Business opportunities",
            "agency":   "Fort Bliss / Mission Installation Contracting Command",
            "naics":    "",
            "posted":   str(datetime.date.today()),
            "deadline": "",
            "url":      "https://www.bliss.army.mil/Staff-and-Offices/MICC/",
            "score":    0,
        },
    ]


# ─────────────────────────────────────────────
# EMAIL DIGEST
# ─────────────────────────────────────────────

def build_email_html(sam_opps, texas_opps, local_reminders):
    today = datetime.date.today().strftime("%A, %B %d, %Y")
    total_leads = len([o for o in sam_opps + texas_opps if o["score"] > 0])

    def opp_row(opp, highlight=False):
        bg = "#f0f7ff" if highlight else "#ffffff"
        score_badge = f'<span style="background:#1a56db;color:#fff;padding:2px 8px;border-radius:12px;font-size:11px;margin-left:8px;">{opp["score"]} match{"es" if opp["score"]>1 else ""}</span>' if opp["score"] > 0 else ""
        return f"""
        <tr style="background:{bg};border-bottom:1px solid #e5e7eb;">
          <td style="padding:14px 16px;">
            <div style="font-weight:600;color:#111827;font-size:14px;">{opp['title']}{score_badge}</div>
            <div style="color:#6b7280;font-size:12px;margin-top:4px;">
              {opp['agency']} &nbsp;·&nbsp; Posted: {opp['posted']} &nbsp;·&nbsp; Deadline: {opp['deadline']}
            </div>
          </td>
          <td style="padding:14px 16px;text-align:right;white-space:nowrap;">
            <span style="background:#f3f4f6;color:#374151;padding:3px 10px;border-radius:4px;font-size:11px;font-family:monospace;">{opp['source']}</span><br>
            <a href="{opp['url']}" style="color:#1a56db;font-size:12px;text-decoration:none;margin-top:6px;display:inline-block;">View →</a>
          </td>
        </tr>"""

    sam_rows    = "".join(opp_row(o, o["score"] >= 2) for o in sorted(sam_opps, key=lambda x: -x["score"])) if sam_opps else "<tr><td colspan='2' style='padding:14px 16px;color:#9ca3af;font-size:13px;'>No new federal opportunities today matching your profile.</td></tr>"
    texas_rows  = "".join(opp_row(o, o["score"] >= 2) for o in sorted(texas_opps, key=lambda x: -x["score"])) if texas_opps else "<tr><td colspan='2' style='padding:14px 16px;color:#9ca3af;font-size:13px;'>No new Texas state opportunities today.</td></tr>"
    local_rows  = "".join(opp_row(o) for o in local_reminders)

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:680px;margin:0 auto;padding:24px 16px;">

    <!-- Header -->
    <div style="background:#111827;border-radius:10px;padding:24px 28px;margin-bottom:16px;">
      <div style="color:#f59e0b;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:8px;">Daily Bid Report · {today}</div>
      <div style="color:#ffffff;font-size:22px;font-weight:700;">Government Contracting Monitor</div>
      <div style="color:#9ca3af;font-size:13px;margin-top:6px;">El Paso, TX · Landscaping · Janitorial · Facilities · Maintenance</div>
    </div>

    <!-- Summary pill -->
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;margin-bottom:16px;display:flex;align-items:center;">
      <span style="background:#f0fdf4;color:#16a34a;padding:6px 14px;border-radius:20px;font-weight:700;font-size:18px;">{total_leads}</span>
      <span style="color:#374151;font-size:14px;margin-left:12px;">keyword-matched opportunit{"y" if total_leads==1 else "ies"} found today across all sources</span>
    </div>

    <!-- SAM.gov -->
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:12px;">
      <div style="background:#1e3a5f;padding:12px 16px;">
        <span style="color:#93c5fd;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">🇺🇸 Federal — SAM.gov</span>
      </div>
      <table style="width:100%;border-collapse:collapse;">{sam_rows}</table>
    </div>

    <!-- Texas SmartBuy -->
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:12px;">
      <div style="background:#7c3aed;padding:12px 16px;">
        <span style="color:#ddd6fe;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">⭐ Texas State — SmartBuy / ESBD</span>
      </div>
      <table style="width:100%;border-collapse:collapse;">{texas_rows}</table>
    </div>

    <!-- Local portals -->
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:16px;">
      <div style="background:#065f46;padding:12px 16px;">
        <span style="color:#a7f3d0;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">📍 Local — El Paso City · County · Fort Bliss</span>
      </div>
      <table style="width:100%;border-collapse:collapse;">{local_rows}</table>
    </div>

    <!-- Footer -->
    <div style="color:#9ca3af;font-size:11px;text-align:center;padding:8px;">
      NAICS monitored: {" · ".join(NAICS_CODES)} &nbsp;·&nbsp; Automated by bid_monitor.py
    </div>

  </div>
</body>
</html>"""


def send_email(html_body):
    if not all([EMAIL_FROM, EMAIL_TO, EMAIL_PASSWORD]):
        print("\n📧 EMAIL NOT CONFIGURED — printing digest instead:\n")
        print(html_body[:2000] + "...\n(truncated — configure email to receive full digest)")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"📋 Gov Bid Report — {datetime.date.today().strftime('%b %d')}"
    msg["From"]    = EMAIL_FROM
    msg["To"]      = EMAIL_TO
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(EMAIL_FROM, EMAIL_PASSWORD)
            server.sendmail(EMAIL_FROM, EMAIL_TO, msg.as_string())
        print(f"✅ Digest sent to {EMAIL_TO}")
    except Exception as e:
        print(f"❌ Email failed: {e}")
        print("   Check EMAIL_FROM, EMAIL_TO, and EMAIL_PASSWORD in your .env file")


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

def main():
    print(f"\n🔍 Running bid monitor — {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"   NAICS codes: {', '.join(NAICS_CODES)}")
    print(f"   Keywords: {len(KEYWORDS)} configured\n")

    print("Checking SAM.gov (Federal)...")
    sam_opps = search_sam_gov()
    print(f"  → {len(sam_opps)} relevant opportunities found")

    print("Checking Texas SmartBuy (State)...")
    texas_opps = search_texas_smartbuy()
    print(f"  → {len(texas_opps)} relevant opportunities found")

    print("Adding local portal reminders...")
    local_reminders = get_local_reminders()

    print("\nBuilding email digest...")
    html = build_email_html(sam_opps, texas_opps, local_reminders)

    print("Sending digest...")
    send_email(html)

    total = len([o for o in sam_opps + texas_opps if o["score"] > 0])
    print(f"\n✅ Done. {total} keyword-matched opportunities found today.")


if __name__ == "__main__":
    main()
