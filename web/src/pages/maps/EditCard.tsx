import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useItemEditStore from "@/stores/useItemEditStore";

export function CardWithForm({
  initialName,
  // onNameChange,
  // onSave,
  // onCancel,
  type,
}: {
  initialName: string;
  // onNameChange: (name: string) => void;
  // onSave: () => void;
  // onCancel: () => void;
  type: "grantee" | "grantor";
}) {
  const [name, setName] = useState(initialName);

  const {
    granteeEditIndex,
    grantorEditIndex,
    setGranteeEditIndex,
    setGrantorEditIndex,
  } = useItemEditStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    // onNameChange(e.target.value);
  };

  const onCancel = () => {
    if (type === "grantee") {
      setGranteeEditIndex(null);
    } else {
      setGrantorEditIndex(null);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit name</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder={`${name}`}
                value={name}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              {/* <Label htmlFor="framework">Framework</Label>
              <Select>
                <SelectTrigger id="framework">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="next">Next.js</SelectItem>
                  <SelectItem value="sveltekit">SvelteKit</SelectItem>
                  <SelectItem value="astro">Astro</SelectItem>
                  <SelectItem value="nuxt">Nuxt.js</SelectItem>
                </SelectContent>
              </Select> */}
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  );
}
