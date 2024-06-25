import React, { useEffect, useState } from "react";
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

const supabaseUrl = "https://dimmbajebuxcomgzbzrj.supabase.co"; // Your Supabase Project URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Your Supabase Key
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

interface ParcelDetailSheetProps {
  blklot: string | null;
  onClose: () => void;
  isSheetOpen: boolean;
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
  }, [blklot, setParcelData]);

  const handleClose = () => {
    setSelectedBlklot(null);
    setSelectedParcelData(null);
  };

  return (
    <div>
      <Sheet open={isSheetOpen} modal={false}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. Click save when youre done.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              {parcelData ? (
                <div>
                  <h1>Parcel Details</h1>
                  <p>Block Lot: {parcelData.blklot}</p>
                  <p>Zoning Code: {parcelData.zoning_code}</p>
                  {/* Display other data as needed */}
                </div>
              ) : (
                <p>Loading...</p>
              )}
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value="Pedro Duarte" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input id="username" value="@peduarte" className="col-span-3" />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">Save changes</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default ParcelDetailSheet;
