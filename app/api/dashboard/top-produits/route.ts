import { NextResponse } from "next/server";

import { DashboardService } from "@/lib/services/dashboard.service";
import { apiHandler } from "@/lib/utils/api-handler";
import { getAuthUser } from "@/lib/auth";


export const GET = apiHandler(
async(req:Request)=>{


 const user =
   await getAuthUser(req);


 const data =
   await DashboardService.topProduits(
     user.id,
     user.role
   );


 return NextResponse.json({
   success:true,
   data
 });


});
