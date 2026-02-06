import { NextRequest } from "next/server";
import { handleRegisterProxy } from "@/lib/scaleupProxy";

export const POST = async (request: NextRequest) => {
  return handleRegisterProxy(request);
};
