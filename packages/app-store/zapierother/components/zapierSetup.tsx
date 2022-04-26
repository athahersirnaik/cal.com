import { ClipboardCopyIcon } from "@heroicons/react/solid";
import { ApiKeyType } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import showToast from "@calcom/lib/notification";
import { Button } from "@calcom/ui";

import Loader from "../../../../apps/web/components/Loader";
import { Tooltip } from "../../../../apps/web/components/Tooltip";
import Icon from "./icon";

interface IZapierSetupProps {
  trpc: any;
}

export default function ZapierSetup(props: IZapierSetupProps) {
  const { trpc } = props;
  const router = useRouter();
  const [newApiKey, setNewApiKey] = useState("");
  const utils = trpc.useContext();
  const integrations = trpc.useQuery(["viewer.integrations"]);
  const oldApiKey = trpc.useQuery(["viewer.apiKeys.findKeyOfType", { apiKeyType: ApiKeyType.ZAPIER }]);
  const deleteApiKey = trpc.useMutation("viewer.apiKeys.delete");
  const zapierCredentials: { credentialIds: number[] } | undefined = integrations.data?.other?.items.find(
    (item: { type: string }) => item.type === "zapier_other"
  );
  const [credentialId] = zapierCredentials?.credentialIds || [false];
  const showContent = integrations.data && integrations.isSuccess && credentialId;

  async function createApiKey() {
    const event = { note: "Zapier", expiresAt: null, apiKeyType: ApiKeyType.ZAPIER };
    const apiKey = await utils.client.mutation("viewer.apiKeys.create", event);
    if (oldApiKey.data) {
      deleteApiKey.mutate({
        id: oldApiKey.data.id,
      });
    }
    setNewApiKey(apiKey);
  }

  if (integrations.isLoading) {
    return (
      <div className="absolute z-50 flex h-screen w-full items-center bg-gray-200">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-200">
      {showContent ? (
        <div className="m-auto rounded bg-white p-10">
          <div className="flex flex-row">
            <div className="mr-5">
              <Icon />
            </div>
            <div className="ml-5">
              <div className="text-gray-600">Setting up your Zapier integration </div>
              {!newApiKey ? (
                <>
                  <div className="mt-1 text-xl">Generate API key:</div>
                  <Button onClick={() => createApiKey()} className="mt-4 mb-4">
                    Generate Api Key
                  </Button>
                </>
              ) : (
                <>
                  <div className="mt-1 text-xl">Your unique API</div>
                  <div className="my-2 mt-3 flex">
                    <div className="mr-1 w-full rounded bg-gray-100 p-3 pr-5">{newApiKey}</div>
                    <Tooltip content="copy to clipboard">
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(newApiKey);
                          showToast("Api key copied", "success");
                        }}
                        type="button"
                        className="px-4 text-base ">
                        <ClipboardCopyIcon className="mr-2 h-5 w-5 text-neutral-100" />
                        copy
                      </Button>
                    </Tooltip>
                  </div>
                  <div className="mt-2 mb-5 text-sm font-semibold text-gray-600">
                    Copy this API key and save it somewhere safe. If you lose this key you have to generate a
                    new one.
                  </div>
                </>
              )}

              <ul className="mt-5 mb-5 mr-5">
                <li>1. Log into your Zapier account and create a new Zap.</li>
                <li>2. Select Cal.com as your Trigger app. Also choose a Trigger event.</li>
                <li>3. Choose your account and then enter your Unique API Key.</li>
                <li>4. Test your Trigger.</li>
                <li>5. You're set!</li>
              </ul>
              <Link href={"/apps/installed"} passHref={true}>
                <Button color="secondary">Done</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 ml-5">
          <div>Please first install the Zapier App in the app store.</div>
          <div className="mt-3">
            <Link href={"/apps/zapier"} passHref={true}>
              <Button>Go to App Store</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
