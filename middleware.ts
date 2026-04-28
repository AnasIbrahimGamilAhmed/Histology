
import { auth } from "@/auth";

export default auth((req: any) => {
  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(loginUrl);
  }
  return undefined;
});

export const config = {
  matcher: ["/study/:path*", "/exam/:path*", "/dashboard/:path*"]
};
