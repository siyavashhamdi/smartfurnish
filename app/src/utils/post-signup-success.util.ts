const POST_SIGNUP_SUCCESS_SESSION_KEY = "post-signup-success";

export function markPostSignupSuccessForRedirect(): void {
  sessionStorage.setItem(POST_SIGNUP_SUCCESS_SESSION_KEY, "1");
}

export function consumePostSignupSuccess(): boolean {
  if (sessionStorage.getItem(POST_SIGNUP_SUCCESS_SESSION_KEY) !== "1") {
    return false;
  }

  sessionStorage.removeItem(POST_SIGNUP_SUCCESS_SESSION_KEY);
  return true;
}
