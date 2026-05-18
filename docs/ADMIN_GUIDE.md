# Lions Wrestling Admin Guide — for coaches

This is for the coaches who run the Lions Wrestling Club website day-to-day. You don't need to know any code. You'll spend most of your time in `/admin`.

> If something looks wrong or you get stuck, email the site administrator. The site is built so that nothing you do in the admin can take it offline.

---

## 1. Logging in

1. Go to **https://lionswrestling.dmcschools.org/admin** (your real URL after deployment).
2. Enter your email and password.
3. The first time you log in, you'll be asked to enroll **two-factor authentication (2FA)**:
   - Open your phone's authenticator app (Google Authenticator, Authy, 1Password, etc.).
   - Scan the QR code displayed in the browser.
   - Enter the 6-digit code from your app.
   - **Save the recovery codes** somewhere safe (password manager). You'll need them if you lose your phone.

Every time you log in after that, you'll need your password plus the current 6-digit code from your app.

### Forgotten password
Click **"Forgot password"** on the login page. We'll email you a one-time reset link (valid for 1 hour). If you also lost your 2FA device, contact the site administrator — they'll reset your account.

---

## 2. The dashboard

After login you land on the admin dashboard. From the left sidebar:

- **Content** — Events, Recaps, Coaches, Pages
- **Gallery** — Photos, Albums
- **Submissions** — Registrations, Contact Submissions
- **Site Config** — Header, Footer, Site Settings, Homepage, Contact Config
- **Admin** — Users, Redirects, Audit Log
- **Media** — generic file uploads (PDFs, banners that aren't gallery photos)

Each page has a list view (filter, sort, search) and a detail view (edit one record).

---

## 3. Adding or editing an event

1. Sidebar → **Content → Events**.
2. Click **"Create new"** (top right) or click an existing event to edit it.
3. Fill out:
   - **Title** — short, like `Dual vs. Johnston`.
   - **Date** — pick from the calendar.
   - **Time** — type how it should display: `5:30 PM`, `All Day`, `10:00 AM`.
   - **All Day** — check this if it's a tournament that runs the full day.
   - **Kind** — Home Match, Away Match, Tournament, or Practice.
   - **Location** — where it happens.
   - **Notes** — anything extra (Senior Night, 14 schools, etc.).
   - **Status** — Draft hides it from the public site. Published shows it.
4. **Save**. The public **/schedule** page updates within a minute.

Tip: Coach mode in the admin shows a month-view calendar. Click a day to add an event quickly.

---

## 4. Writing a recap

After a match or tournament, post a recap so families see what happened.

1. Sidebar → **Content → Recaps → Create new**.
2. Fill out:
   - **Date** — when the event happened.
   - **Kicker** — small label above the title, like `Home Dual · CIML`.
   - **Title** — like `Lions storm Valley HS, 52 – 18`.
   - **Body** — rich text. Type freely; use the toolbar for bold, lists, headings. Add photos if you want.
   - **Tags** — optional chips with quick stats. Add one for each: `8 pins`, `Senior Night`, etc.
   - **Featured** — pin to the homepage if it's a big one.
   - **Status** — Draft saves without publishing. Published shows it on `/results`.
3. **Save** (or **Save as draft** to come back later).

You can also **schedule** a recap to publish at a future date — useful for embargoing tournament writeups.

---

## 5. Uploading photos

1. Sidebar → **Gallery → Photos → Create new**.
2. Drag and drop an image (JPG, PNG, or WebP).
3. **Alt text is required** — describe the photo for visually impaired visitors. Example: "Three Lions wrestlers raise their arms after a tournament win."
4. **Caption** — optional friendly caption.
5. **Date** — when the photo was taken.
6. **Album** — pick one (or leave blank).
7. **Featured** — if checked, this photo can appear in the homepage gallery strip (top 6 featured).
8. **Save**.

To upload many photos at once, use **Bulk upload** from the Photos list view.

### Creating an album
Sidebar → **Gallery → Albums → Create new**. Set a title; the slug is auto-filled. Pick a cover photo. Photos can be assigned to the album later.

---

## 6. Editing coach bios

Sidebar → **Content → Coaches**. Each coach is one record with name, role, photo, bio (rich text), email, and a sort order (lower numbers appear first).

The `/about` page reads from this collection automatically.

---

## 7. Editing the homepage

Sidebar → **Site Config → Homepage**. You'll see tabs:

- **Hero** — eyebrow, heading, subheading, hero background image, primary + secondary CTA.
- **Mission** — heading, body text, mission photo.
- **Programs** — the three program cards.
- **Testimonial** — quote, author, role.

Edits show up on the public site within a minute.

---

## 8. Reordering the main navigation

Sidebar → **Site Config → Header**. Drag items in the **Nav items** list to reorder. Use **Add row** to add a new link. Each item can point to:

- An internal URL (e.g. `/about`)
- A Page from the page builder
- An external URL (check **Open in new tab**)

Save. The header updates everywhere.

---

## 9. Site settings (name, tagline, favicon, analytics)

Sidebar → **Site Config → Site Settings**. Edit:

- **Site name** — used as the default title.
- **Tagline** — used in meta descriptions.
- **Default OG image** — used for social media share previews.
- **Favicon** — the little icon in the browser tab.
- **Cloudflare Analytics Token** — leave blank to disable analytics. If you have a token, paste it here.
- **Featured video URL** — YouTube link shown at the top of `/gallery`.
- **Maintenance mode** — flip this on to show a "We'll be back shortly" page. Coaches and admins can still access `/admin`.

---

## 10. Registrations

Sidebar → **Submissions → Registrations**. Every form submission from `/register` lands here.

- Click a row to view the wrestler and parent info.
- Update **Status**: New → Contacted → Enrolled (or Archived).
- Add **Internal notes** that only admins/coaches can see.
- Export the full list to CSV via the **Export** button (top right).

Coaches **cannot edit** submitted data — that protects the family's submitted info. Only **status** and **internal notes** are editable.

---

## 11. Contact submissions

Sidebar → **Submissions → Contact Submissions**. Same pattern: view, change status (New / Read / Replied / Archived / Spam), add internal notes. Reply via the **email link** that opens your mail client with the To/Subject pre-filled.

---

## 12. Managing redirects

Sidebar → **Admin → Redirects**. If a page URL changes (e.g. `/camps-2025` is now `/camps`), add a row:

- **From** — `/camps-2025`
- **To** — `/camps`
- **Type** — `301` (permanent) or `302` (temporary)
- **Enabled** — check to activate

Save. The site will redirect requests automatically.

---

## 13. Building a custom page (Pages collection)

For pages beyond the seven built-in ones (booster club, camps, etc.):

1. Sidebar → **Content → Pages → Create new**.
2. **Title** + **Slug** (e.g. `camps`). The URL becomes `/camps`.
3. **Layout**: click **Add block** to drop in any of: Hero, RichText, CtaStrip, FAQ, Media Embed.
4. Each block has its own fields — fill them out.
5. **SEO** tab — optional meta title, description, og image.
6. **Status** → Published when ready.

Use **Live Preview** (top right) to see the page render as you edit.

---

## 14. Restoring a previous version

For Events, Recaps, and Pages: click into the record, then **Versions** tab. You'll see every save. Click an older version → **Restore**.

---

## 15. Inviting a new coach

Admins only.

1. Sidebar → **Admin → Users → Create new**.
2. Enter name, email, and pick **Role**:
   - **Admin** — full access, can manage users.
   - **Coach** — can edit events, recaps, photos, registrations.
   - **Viewer** — read-only.
3. **Save**. The new user gets an email with a link to set their password and enroll 2FA on first login.

To deactivate someone: open their user record → uncheck **Active** → Save. They can no longer log in but their history is preserved.

---

## 16. Audit log

Sidebar → **Admin → Audit Log**. Read-only record of important actions (logins, role changes, deletes, settings changes). Useful for security review.

---

## 17. Need help?

- Email the site administrator if you're stuck.
- The site cannot be broken from inside the admin — if you misclick something, you can almost always undo via Versions.
- For 2FA recovery, the administrator can reset your account.

Welcome aboard. Go Lions. 🦁
