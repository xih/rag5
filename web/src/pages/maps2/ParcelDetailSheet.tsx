import React, { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/generated/db";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import useParcelStore from "@/stores/useParcelStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as changeCase from "change-case";
import { capitalCase } from "change-case";

const supabaseUrl = "https://dimmbajebuxcomgzbzrj.supabase.co"; // Your Supabase Project URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Your Supabase Key
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

interface ParcelDetailSheetProps {
  blklot: string | null;
  onClose: () => void;
  isSheetOpen: boolean;
}

interface ParcelData {
  from_address_num?: number | null;
  to_address_num?: number | null;
  street_name?: string | null;
  street_type?: string | null;
}

function formatAddress(parcelData: ParcelData): string {
  if (
    !parcelData.from_address_num ||
    !parcelData.to_address_num ||
    !parcelData.street_name ||
    !parcelData.street_type
  ) {
    return "Incomplete address data";
  }
  const { from_address_num, to_address_num, street_name, street_type } =
    parcelData;
  // Check if the from and to address numbers are the same
  if (from_address_num === to_address_num) {
    return capitalCase(`${from_address_num} ${street_name} ${street_type}`);
  } else {
    return (
      `${from_address_num}-${to_address_num}` +
      " " +
      capitalCase(`${street_name} ${street_type}`)
    );
  }
}

const ParcelDetailSheet: React.FC<ParcelDetailSheetProps> = ({
  blklot,
  onClose,
  isSheetOpen,
}) => {
  const parcelData = useParcelStore((state) => state.selectedParcelData);
  const setParcelData = useParcelStore((state) => state.setSelectedParcelData);
  const setSelectedBlklot = useParcelStore((state) => state.setSelectedBlklot);
  const setSelectedParcelData = useParcelStore(
    (state) => state.setSelectedParcelData
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  const address = parcelData ? formatAddress(parcelData) : "";

  useEffect(() => {
    const fetchData = async () => {
      if (!blklot) {
        console.error("error");
        return;
      }
      const { data, error } = await supabase
        .from("parcels")
        .select()
        .eq("mapblklot", blklot);

      if (error) {
        console.error("Error fetching parcel data:", error);
      } else {
        if (data && data.length > 0) {
          setParcelData(data[0]); // Pass the first element of the array
        } else {
          console.error("No data found for the given blklot");
        }
      }
    };

    fetchData();

    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    } else {
      console.log("ScrollRef is not set.");
    }
  }, [blklot, setParcelData]);

  return (
    <Sheet open={isSheetOpen} modal={false}>
      <SheetContent className="p-0">
        <ScrollArea ref={scrollRef} className="h-[100vh] w-full p-6">
          <SheetHeader>
            <SheetTitle>{address}</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. Click save when youre done.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              {parcelData ? <></> : <p>Loading...</p>}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              {parcelData &&
                Object.keys(parcelData)
                  .filter(
                    (key) =>
                      key !== "shape" &&
                      key !== "shape_geojson" &&
                      key !== "centroid"
                  )
                  .map((key) => (
                    <>
                      <Label
                        htmlFor={key}
                        className="text-left col-span-4 text-gray-500 -mb-2"
                      >
                        {key}
                      </Label>
                      <span id={key} className="col-span-4">
                        {String(parcelData[key as keyof typeof parcelData])}
                      </span>
                    </>
                  ))}
            </div>
          </div>
          <SheetFooter>
            {/* <SheetClose asChild>
              <Button type="submit">Save changes</Button>
            </SheetClose> */}
          </SheetFooter>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ParcelDetailSheet;
