"use client";

import { Switch } from "@ui/components/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import { Fragment, useState } from "react";
import pack from "@/package.json";

export default function Page() {
  const [light, setLight] = useState(false);

  const handleLight = () => {
    setLight((old) => !old);
  };

  return (
    <main className="pt-12 px-4">
      <div className="grid grid-cols-8 gap-4">
        <div className="col-start-2 col-span-5">
          <h1 className="mb-8 text-2xl font-medium">
            Package 7IBO/one-piece-wiki
          </h1>
          <div className="flex flex-col h-96">
            <Tabs defaultValue="account" className="w-[400px]">
              <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>
              <TabsContent value="account">
                Make changes to your account here.
              </TabsContent>
              <TabsContent value="password">
                Change your password here.
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="col-span-2">
          <div className="rounded-lg border flex flex-col gap-2 max-h-[80vh] overflow-auto p-4">
            <h3 className="text-lg font-medium mb-2">Dependencies</h3>
            <div className="flex flex-col w-full gap-1.5">
              {Object.entries(pack.dependencies)
                .filter(([, value]) => !value.includes("*"))
                .map(([key, value], index, initialArray) => (
                  <Fragment key={key}>
                    <div className="flex justify-between gap-2">
                      <p className="font-medium">
                        {key}
                        <span className="font-thin text-primary/70 ml-3">
                          v{value.replace("^", "")}
                        </span>
                      </p>
                      <Switch />
                    </div>
                    {index !== initialArray.length - 1 && <hr />}
                  </Fragment>
                ))}
            </div>

            <hr className="mt-4 mb-6" />

            <h3 className="text-lg font-medium mb-2">Dev dependencies</h3>
            <div className="flex flex-col w-full gap-1.5">
              {Object.entries(pack.devDependencies)
                .filter(([, value]) => !value.includes("*"))
                .map(([key, value], index, initialArray) => (
                  <Fragment key={key}>
                    <div className="flex justify-between gap-2">
                      <p className="font-medium">
                        {key}
                        <span className="font-thin text-primary/70 ml-3">
                          v{value.replace("^", "")}
                        </span>
                      </p>
                      <Switch />
                    </div>
                    {index !== initialArray.length - 1 && <hr />}
                  </Fragment>
                ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
