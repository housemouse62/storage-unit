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
- [ ] Add delete confirmation before permanent file/folder deletion (modal or `confirm()`)
- [x] Add `aria-live="polite"` or `role="alert"` to form error containers so screen readers announce them
- [ ] Add `autocomplete="current-password"` to login password field

## UX

- [ ] Move share URL out of `<h2>` in `shared.ejs` — put it in a readonly `<input>` with a copy-to-clipboard button
- [ ] Show remaining time on shared folder page before expiry
- [ ] Add empty state messaging when a user has no folders or files
- [ ] Show error messages on failed login (currently no feedback)

## Code Quality

- [ ] Remove `console.log` calls from routes before portfolio presentation
- [ ] Remove Cloudinary config duplication in `fileRouter.js` (lines 13–17) — use `config/cloudinary.js` only
- [ ] Add `uploads/` directory to `.gitignore` (or clean up the 40 stale local files)
- [ ] Validate `parseInt()` params in routes — a non-numeric ID silently becomes `NaN`
