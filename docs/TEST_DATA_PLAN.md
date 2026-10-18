# Test data plan: Riverstone Coffee Roasters

All test data describes one fictional small business, so it reads like real work instead of
"test item 1, test item 2", and so that one dashboard search returns related results from
several services at once.

## The story

**Riverstone Coffee Roasters** is a small specialty roaster in the Hudson Valley. The owner
(the test account) is preparing two things for the holiday season: an **online storefront**
and a limited **Holiday Blend** (Ethiopia Yirgacheffe with Colombia Huila).

| Person | Role | Appears in |
|---|---|---|
| **Dana Whitfield** | Operations manager | Gmail, Notion, Linear, GitHub |
| **Marcus Lee** | Freelance web developer building the storefront | GitHub, Linear, Notion, Gmail |
| **Priya Raman** | Designer (labels, landing page) | Notion, Linear, Gmail |
| **Tom Becker** | Green-coffee importer at Highland Imports | Gmail, Notion |
| **Elena Ortiz** | Owner of Corner Table Café, a wholesale customer | Gmail, Notion, Linear |

Good dashboard searches that will hit several services: **`Dana Whitfield`**,
**`"Holiday Blend"`**, **`Marcus Lee`**, **`Yirgacheffe`**, **`Corner Table`**, **`checkout`**.

---

## Gmail (10+ received emails)

The official Gmail MCP server can read and create drafts but **cannot send**, so the emails
must arrive from another account:

1. Create a second throwaway Gmail account and set its name to **Dana Whitfield**
   (Google Account → Personal info → Name). Do not use a personal account.
2. From that account, send the eight emails below to the test Gmail. Space them out over
   an hour or two if you can, so timestamps differ.
3. From the test Gmail, **reply** to emails 2 and 6 with a sentence or two each. Replies
   create threads, which look realistic.
4. Signing up for GitHub, Notion, Linear and Google Cloud already sent real welcome and
   notification emails to the test inbox. Keep them: they count as natural items and come from
   different senders. Together you'll have well over ten.

**Email 1**
Subject: `Holiday Blend - green coffee confirmed`
> Hi,
>
> Good news: Tom Becker at Highland Imports confirmed our order of 6 bags of Ethiopia Yirgacheffe (Grade 1, washed) and 4 bags of Colombia Huila for the Holiday Blend. They ship from the warehouse on October 28 and should land with us by November 3.
>
> I've updated the supplier directory in Notion. Can you approve the invoice when it comes in?
>
> Dana

**Email 2**
Subject: `Storefront checkout - Marcus needs a decision`
> Hey,
>
> Marcus Lee says the storefront checkout is ready except for one choice: do we offer local pickup at the roastery, or shipping only? Pickup means he has to add a pickup-time picker, about two extra days of work.
>
> He's tracking it in Linear. Can you weigh in by Thursday so he can keep the November 10 launch date?
>
> Dana

**Email 3**
Subject: `Label proofs for Holiday Blend from Priya`
> Hi,
>
> Priya Raman sent the final label proofs for the Holiday Blend. Two versions: the red one with the snowy river illustration, and a navy one. I lean red, it pops on the shelf.
>
> She needs our pick by Friday to make the print deadline. Proofs are in the Notion launch page.
>
> Dana

**Email 4**
Subject: `Corner Table Cafe wants to increase their wholesale order`
> Hi,
>
> Elena Ortiz from Corner Table Café called. They want to go from 10 lb to 20 lb of house espresso every two weeks starting in November, and asked whether they can get the Holiday Blend for December too.
>
> At 20 lb they move into our tier 2 wholesale price. I added notes to the wholesale pricing page in Notion. OK to confirm with her?
>
> Dana

**Email 5**
Subject: `Roaster maintenance scheduled Oct 24`
> Hi,
>
> Quick heads-up: the technician is coming on Saturday, October 24 to service the roaster (chaff collector cleaning and burner inspection). No roasting that day, so I'll move the Saturday batch to Friday afternoon.
>
> I logged it as a task in Linear so we remember to do this every six months.
>
> Dana

**Email 6**
Subject: `Holiday market booth - need headcount`
> Hi,
>
> The Beacon Holiday Market confirmed our booth for December 12–13. I need to know who's staffing it. I can do Saturday; can you cover Sunday? We'll need the pour-over setup, two grinders, and about 40 bags of Holiday Blend to sell.
>
> The booth plan is in Notion.
>
> Dana

**Email 7**
Subject: `Bug on the storefront test site`
> Hi,
>
> I was testing the storefront and when I add the Holiday Blend to the cart and change the grind to "espresso", the price drops to $0.00. Screenshot is in the GitHub issue Marcus opened. He thinks it's the variant pricing code and said he'll fix it this week.
>
> Dana

**Email 8**
Subject: `Notes from today's ops meeting`
> Hi,
>
> Summary of today's ops meeting:
> - Holiday Blend roast tests: profile B (light-medium, 11:30 total) was the clear favorite.
> - Storefront launch still on track for November 10.
> - Corner Table Café increase approved pending your OK.
> - Need to order more 12 oz bags. I'll handle it.
>
> Full notes are in Notion under Weekly Ops Meeting.
>
> Dana

---

## GitHub, Notion and Linear (one Claude Code conversation)

This is **Conversation A** in the setup guide. Open `claude` in the project folder, make
sure `/mcp` shows github, notion and linear connected, then paste the prompt below. Review
each action Claude proposes before approving it.

````text
I'm populating three TEST accounts for a class project with realistic data about a
fictional business, Riverstone Coffee Roasters, a small Hudson Valley coffee roaster.
The owner is preparing an online storefront (launching November 10) and a limited
Holiday Blend (Ethiopia Yirgacheffe + Colombia Huila). Recurring people:
Dana Whitfield (operations manager), Marcus Lee (freelance web developer),
Priya Raman (designer), Tom Becker (green-coffee importer at Highland Imports),
Elena Ortiz (owner of Corner Table Cafe, a wholesale customer).
Mention these people and projects naturally and consistently across all services.
Use only the official MCP servers that are connected (github, notion, linear).
Do not create anything in this project folder.

1) GITHUB - create these 10 PUBLIC repositories in my account. Each needs a real
   README.md (purpose, how to run, who is involved), a sensible description, and
   2-3 issues where it makes sense. Use small, plausible starter files in a few.
   - storefront-web: the online store (Marcus Lee). Issue: "Price shows $0.00 when grind
     is set to espresso" (reported by Dana Whitfield); issue: "Add Holiday Blend product page".
   - holiday-blend-landing: one-page landing site for the Holiday Blend (Priya Raman design).
   - roast-profile-logger: small Python tool to log roast curves; README mentions the
     Holiday Blend profile B tests.
   - inventory-sync: script syncing green coffee inventory; mentions Highland Imports.
   - wholesale-order-portal: ordering portal for cafe customers; issue about Corner Table
     Cafe moving to tier 2 pricing.
   - brew-guides: Markdown brew guides (pour-over, French press, espresso) for the website.
   - subscription-api: coffee subscription backend, early stage.
   - shipping-rate-calculator: estimates shipping for 12 oz and 2 lb bags.
   - barista-training: training checklist and quiz for new baristas.
   - email-templates: HTML email templates for order confirmation and the launch announcement.

2) NOTION - create these 10 pages at the top level of my workspace, with real structure
   (headings, bullet lists, to-dos, a table where useful):
   - Holiday Blend Launch Plan (timeline, label proofs from Priya Raman, roast profile B,
     40 bags for the holiday market)
   - Weekly Ops Meeting - Oct 6
   - Weekly Ops Meeting - Oct 13 (matches Dana's summary: profile B favorite, launch on
     track for Nov 10, Corner Table increase pending, order more 12 oz bags)
   - Green Coffee Supplier Directory (table: Highland Imports / Tom Becker, two others)
   - Roast Profile - Ethiopia Yirgacheffe
   - Storefront Launch Checklist (to-dos; checkout pickup-vs-shipping decision open;
     owner Marcus Lee)
   - Wholesale Pricing 2026 (tiers; note about Corner Table Cafe moving to 20 lb)
   - Brand Voice Guide
   - Beacon Holiday Market Booth Plan (Dec 12-13, staffing, equipment list)
   - Barista Training Plan

3) LINEAR - in team Riverstone (RIV), create projects "Storefront Launch" and
   "Holiday Blend". Create 12 issues across them with varied states (Backlog, Todo,
   In Progress, Done), priorities, labels (storefront, bug, design, operations, wholesale),
   due dates around late October to mid December, and a comment on at least 5 of them.
   Include: "Decide local pickup vs shipping-only for checkout" (mentions Marcus Lee,
   due Thursday), "Fix $0.00 price when grind is espresso" (bug, links the GitHub issue),
   "Approve Holiday Blend label (red vs navy)" (Priya Raman), "Confirm Corner Table Cafe
   tier 2 wholesale" (Elena Ortiz), "Schedule roaster maintenance every 6 months"
   (Done, Oct 24), "Order 12 oz bags", "Staff Beacon Holiday Market booth", and others
   that fit the story.

When finished, give me a checklist with counts per service and links.
````

After it finishes, open github.com, notion.so and linear.app and confirm each has at least
10 items. Then take the "original content" screenshots and type `/clear`.
