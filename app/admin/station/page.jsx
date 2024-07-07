import BreadCrumb from "@/components/Breadcrumb";
import { columns } from "@/components/tables/station-columns";
import { CustomTable } from "@/components/tables/table";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getStations } from "@/app/actions/station";

const breadcrumbItems = [{ title: "Station", link: "/admin/station" }];

export default async function page({ searchParams }) {
  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 10;
  const search = searchParams.search || null;
  const offset = (page - 1) * pageLimit;

  const stationRes = await getStations(search, offset, pageLimit);
  const totalStations = stationRes.totalStations; //1000
  const pageCount = Math.ceil(totalStations / pageLimit);
  const station = stationRes.stations;

  return (
    <div className="flex-1 space-y-4  p-4 pt-6 md:p-8">
      <BreadCrumb items={breadcrumbItems} />

      <div className="flex items-start justify-between">
        <Heading
          title={`Stations (${totalStations})`}
          description="Manage stations (Server side table functionalities.)"
        />

        <Link
          href={"/admin/station/new"}
          className={cn(buttonVariants({ variant: "default" }))}
        >
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Link>
      </div>
      <Separator />

      <CustomTable
        searchKey="name"
        pageNo={page}
        columns={columns}
        data={station}
        pageCount={pageCount}
      />
    </div>
  );
}
