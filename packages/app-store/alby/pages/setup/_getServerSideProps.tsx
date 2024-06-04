import type { GetServerSidePropsContext } from "next";

import { auth } from "@calcom/features/auth";
import prisma from "@calcom/prisma";

import { getAlbyKeys } from "../../lib/getAlbyKeys";
import type { IAlbySetupProps } from "./index";

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const notFound = { notFound: true } as const;

  if (typeof context.params?.slug !== "string") return notFound;

  const session = await auth(context);

  if (!session?.user?.id) {
    const redirect = { redirect: { permanent: false, destination: "/auth/login" } } as const;

    return redirect;
  }

  const credentials = await prisma.credential.findFirst({
    where: {
      type: "alby_payment",
      userId: session?.user.id,
    },
  });

  const { client_id: clientId, client_secret: clientSecret } = await getAlbyKeys();

  const props: IAlbySetupProps = {
    email: null,
    lightningAddress: null,
    clientId,
    clientSecret,
  };
  if (credentials?.key) {
    const { account_lightning_address, account_email } = credentials.key as {
      account_lightning_address?: string;
      account_email?: string;
    };
    if (account_lightning_address) {
      props.lightningAddress = account_lightning_address;
    }
    if (account_email) {
      props.email = account_email;
    }
  }

  return {
    props,
  };
};
