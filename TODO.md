# Storage Unit — TODO

## Critical

- [x] Add CSRF protection to all forms (`csrf-csrf`)
- [x] Add rate limiting to `/login` and `/createUser` (`express-rate-limit`)
- [x] Remove duplicate bcrypt package — keep `bcryptjs`, remove `bcrypt` from package.json

## High

- [x] Uncomment error display in `createUserPage.ejs` — validation errors are never shown to users
- [x] Add email validation on user registration (`express-validator` is installed, just unused for email)
- [x] Validate share duration input — reject 0, negative numbers, and unreasonably large values
- [x] Validate folder names — reject empty strings on create and rename

## Accessibility (WCAG 2.1 AA)

- [x] Add `id="main-content"` to all pages — skip link silently fails without it
  - `allFolders.ejs`, `oneFolder.ejs`, `allFiles.ejs`, `fileDetails.ejs`, `loggedOutPage.ejs`, `errorPage.ejs`
- [x] Fix `vale=` typo → `value=` in `loginPage.ejs`
- [x] Remove duplicate `</header>` tag in `loggedOutPage.ejs`
- [x] Add delete confirmation before permanent file/folder deletion (modal or `confirm()`)
- [x] Add `aria-live="polite"` or `role="alert"` to form error containers so screen readers announce them
- [x] Add `autocomplete="current-password"` to login password field

## UX

- [x] Move share URL out of `<h2>` in `shared.ejs` — put it in a readonly `<input>` with a copy-to-clipboard button
- [x] Show remaining time on shared folder page before expiry
- [x] Add empty state messaging when a user has no folders or files
- [x] Show error messages on failed login (currently no feedback)

## Code Quality

- [x] Remove `console.log` calls from routes before portfolio presentation
- [x] Remove Cloudinary config duplication in `fileRouter.js` (lines 13–17) — use `config/cloudinary.js` only
- [x] Add `uploads/` directory to `.gitignore` (or clean up the 40 stale local files)
- [x] Validate `parseInt()` params in routes — a non-numeric ID silently becomes `NaN`

## Security (from audit)

- [x] XSS in `errorPage.ejs` — uses `<%-` (unescaped) to render `locals.error`, change to `<%=`
- [x] Logout route case mismatch — form posts to `/logout` but route is `/logOut`, verify they match
- [x] Session config — `resave: true` and `saveUninitialized: true` in `app.js`, prefer `false` for both

## Accessibility (from audit)

- [ ] Malformed error `<p>` tags in `allFolders.ejs` and `oneFolder.ejs` — EJS conditionals render content outside the element, breaking `aria-live`
- [ ] Missing `<label>` for file name input in `oneFolder.ejs` (`id="name"`, placeholder only)
- [ ] Email field not repopulating on login error — `loginPage.ejs` uses `<%` instead of `<%=` on value attribute
- [ ] Caption typo in `allFolders.ejs` — "All Folders is the Storage Unit" → "in"
