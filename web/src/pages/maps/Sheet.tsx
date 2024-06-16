import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Datatype2 } from ".";
import * as changeCase from "change-case";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import DropdownMenuComponent from "./DropdownMenuComponent";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export function SheetDemo({
  isSheetOpen,
  propertyData,
}: // onClose,
{
  isSheetOpen: boolean;
  propertyData: Datatype2;
  // onClose: () => void;
}) {
  const {
    apn,
    block,
    booknumber,
    booktype,
    createdat,
    documentdate,
    documentid,
    filingcode,
    grantee,
    grantor,
    id,
    latitude,
    longitude,
    lot,
    nameinternalid,
    names,
    numberofpages,
    primarydocnumber,
    secondarydocnumber,
    totalnamescount,
    updatedat,
  } = propertyData;

  const router = useRouter();
  const [currentPropertyData, setCurrentPropertyData] =
    useState<Datatype2 | null>(null);

  const grantorSplit = grantor.split(",");
  const granteeSplit = grantee.split(",");

  const grantorSplitFormated = grantorSplit.map((item) =>
    changeCase.capitalCase(item)
  );
  const granteeSplitFormated = granteeSplit.map((item) =>
    changeCase.capitalCase(item)
  );

  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(propertyData.grantee);
  const [originalItem, setOriginalItem] = useState(propertyData.grantee);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = () => {
    setOriginalItem(currentItem);
    setEditMode(false);
  };

  const handleRevert = () => {
    setCurrentItem(originalItem);
    setEditMode(false);
  };

  return (
    <Sheet open={isSheetOpen} modal={false}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>APN: {apn}</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Current Owner
            </Label>
            {/* <Input id="name" value="Pedro Duarte" className="col-span-3" /> */}
            <div className="col-span-3">
              {granteeSplitFormated.map((item, index) => {
                return (
                  <div
                    key={index}
                    className="mb-1 justify-between flex items-center"
                  >
                    <div className="flex">{item}</div>
                    <DropdownMenuComponent
                      fullName={item}
                      onEdit={handleEdit}
                      onRevert={handleRevert}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Previous Owner
            </Label>
            {/* <Input id="name" value="Pedro Duarte" className="col-span-3" /> */}
            <div className="col-span-3">
              {grantorSplitFormated.map((item, index) => (
                <div key={index} className="mb-1">
                  {item}
                </div>
              ))}
            </div>
            {/* <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" value="@peduarte" className="col-span-3" /> */}
          </div>
        </div>
        <SheetFooter>
          {/* <SheetClose asChild >
            <Button type="submit">Save changes</Button>
          </SheetClose> */}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
