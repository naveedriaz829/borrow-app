import { MORPHO_ABI } from "@/lib/morpho-abi";
import { MORPHO_BUNDLER_ABI } from "@/lib/morpho-bundler-abi";
import {
  MORPHO_BORROW_ABI,
  MORPHO_REPAY_ABI,
  MORPHO_SUPPLY_COLLATERAL_ABI,
} from "@/lib/morpho-general-adapter-abi";
import { getUserPosition } from "@/lib/position";
import { describe, expect, test } from "bun:test";
import {
  createPublicClient,
  createWalletClient,
  erc20Abi,
  formatEther,
  http,
  keccak256,
  parseEther,
  toFunctionSignature,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { worldchain } from "viem/chains";
import { Morpho } from "../lib/morpho";

describe("Morpho", async () => {
  test("private key is defined", () => {
    expect(process.env.WORLD_PRIVATE_KEY).toBeDefined();
  });

  const publicClient = createPublicClient({
    transport: http(),
    chain: worldchain,
  });

  const walletClient = createWalletClient({
    transport: http(),
    chain: worldchain,
    account: privateKeyToAccount(
      process.env.WORLD_PRIVATE_KEY as `0x${string}`
    ),
  });

  const walletAddress = walletClient.account.address;

  test("private key has eth and wld balance", async () => {
    const wldBalance = await publicClient.readContract({
      address: morpho.marketConfig.collateralToken,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [walletAddress],
    });
    const ethBalance = await publicClient.getBalance({
      address: walletAddress,
    });

    expect(ethBalance).toBeGreaterThan(parseEther("0.0001"));
    expect(wldBalance).toBeGreaterThan(parseEther("1"));

    console.log(
      `using account ${walletAddress} with ETH balance ${formatEther(
        ethBalance
      )} WLD balance ${formatEther(wldBalance)}`
    );
  });

  const collateralAmount = parseEther("1"); // 1 WLD

  const morpho = new Morpho(publicClient);

  test("max borrowable amount", async () => {
    const maxBorrowableAmount = await morpho.getMaxBorrowableAmount(
      collateralAmount
    );
    expect(maxBorrowableAmount).toBeGreaterThan(0n);
  });

  test("WLD/USDCe price from Morpho Oracle", async () => {
    const price = await morpho.getWLDPrice();
    expect(price).toBeGreaterThan(0n);
  });

  test.skip("print out methods based on abis", () => {
    const signatures = [];
    for (const abi of [
      MORPHO_ABI,
      MORPHO_BUNDLER_ABI,
      MORPHO_BORROW_ABI,
      MORPHO_REPAY_ABI,
      MORPHO_SUPPLY_COLLATERAL_ABI,
      erc20Abi as any,
    ]) {
      signatures.push(getMethodSignatures(abi));
    }
    Bun.write("method-signatures.json", JSON.stringify(signatures, null, 2));
  });

  const testOnBehalf = "0xa565aa0677c387e0b599e6035a44438f596a2fc5"; // WLD user address, from within miniapp

  test("create borrow bundle", () => {
    const expectedBundle = [
      {
        to: "0x30fa9a3cf56931aceea42e28d35519a97d90aa67",
        data: "0xca46367300000000000000000000000079a02482a880bce3f13e09da970dc34db4cd24d10000000000000000000000002cfc85d8e48f8eab294be644d9e25c30308630030000000000000000000000008006a014e828a458545e6613c4b35cd64b5143d500000000000000000000000034e99d604751a72cf8d0cfdf87069292d82de4720000000000000000000000000000000000000000000000000aaf96eb9d0d00000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000a565aa0677c387e0b599e6035a44438f596a2fc500000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000",
        value: "0x0", // its actually "0" in the tenderly debugger, but 0x0 gets serialized to 0 by world bundler
        skipRevert: false,
        callbackHash:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      },
      {
        to: "0x30fa9a3cf56931aceea42e28d35519a97d90aa67",
        data: "0x62577ad000000000000000000000000079a02482a880bce3f13e09da970dc34db4cd24d10000000000000000000000002cfc85d8e48f8eab294be644d9e25c30308630030000000000000000000000008006a014e828a458545e6613c4b35cd64b5143d500000000000000000000000034e99d604751a72cf8d0cfdf87069292d82de4720000000000000000000000000000000000000000000000000aaf96eb9d0d000000000000000000000000000000000000000000000000000000000000000c350000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a565aa0677c387e0b599e6035a44438f596a2fc5",
        value: "0x0",
        skipRevert: false,
        callbackHash:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      },
    ];
    const bundle = morpho.createBorrowBundle(
      parseEther("1"),
      800000n,
      testOnBehalf
    );
    expect(JSON.stringify(bundle)).toBe(JSON.stringify(expectedBundle));
  });

  test("create repay bundle", () => {
    const expectedBundle = [
      {
        to: "0x30fa9a3cf56931aceea42e28d35519a97d90aa67",
        data: "0x4d5fcf6800000000000000000000000079a02482a880bce3f13e09da970dc34db4cd24d10000000000000000000000002cfc85d8e48f8eab294be644d9e25c30308630030000000000000000000000008006a014e828a458545e6613c4b35cd64b5143d500000000000000000000000034e99d604751a72cf8d0cfdf87069292d82de4720000000000000000000000000000000000000000000000000aaf96eb9d0d00000000000000000000000000000000000000000000000000000000000000061a8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000364603a728c6ab61a3000000000000000000000000a565aa0677c387e0b599e6035a44438f596a2fc500000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000000",
        value: "0x0",
        skipRevert: false,
        callbackHash:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      },
      {
        to: "0x30fa9a3cf56931aceea42e28d35519a97d90aa67",
        data: "0x3790767d00000000000000000000000079a02482a880bce3f13e09da970dc34db4cd24d1000000000000000000000000a565aa0677c387e0b599e6035a44438f596a2fc5ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        value: "0x0",
        skipRevert: true,
        callbackHash:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      },
    ];
    const bundle = morpho.createRepayBundle(
      "400000",
      testOnBehalf,
      "1001169239781474525603"
    );
    expect(JSON.stringify(bundle)).toBe(JSON.stringify(expectedBundle));
  });

  test("get user position", async () => {
    const position = await getUserPosition(publicClient, walletAddress);
    console.log(stringifyWithBigInt(position));
    expect(position).toBeDefined();
  });

  test("create supply collateral bundle", async () => {
    const expectedBundle = [
      {
        to: "0x30fa9a3cf56931aceea42e28d35519a97d90aa67",
        data: "0xca46367300000000000000000000000079a02482a880bce3f13e09da970dc34db4cd24d10000000000000000000000002cfc85d8e48f8eab294be644d9e25c30308630030000000000000000000000008006a014e828a458545e6613c4b35cd64b5143d500000000000000000000000034e99d604751a72cf8d0cfdf87069292d82de4720000000000000000000000000000000000000000000000000aaf96eb9d0d00000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000a565aa0677c387e0b599e6035a44438f596a2fc500000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000",
        value: "0x0",
        skipRevert: false,
        callbackHash:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      },
    ];
    const bundle = morpho.createSupplyCollateralBundle(
      "1000000000000000000",
      testOnBehalf
    );
    expect(JSON.stringify(bundle)).toBe(JSON.stringify(expectedBundle));
  });

  test("create withdraw collateral bundle", async () => {
    const expectedBundle = [
      {
        to: "0x30fa9a3cf56931aceea42e28d35519a97d90aa67",
        data: "0x1af3bbc600000000000000000000000079a02482a880bce3f13e09da970dc34db4cd24d10000000000000000000000002cfc85d8e48f8eab294be644d9e25c30308630030000000000000000000000008006a014e828a458545e6613c4b35cd64b5143d500000000000000000000000034e99d604751a72cf8d0cfdf87069292d82de4720000000000000000000000000000000000000000000000000aaf96eb9d0d00000000000000000000000000000000000000000000000000001da9c46b26ca4216000000000000000000000000a565aa0677c387e0b599e6035a44438f596a2fc5",
        value: "0x0",
        skipRevert: false,
        callbackHash:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      },
      {
        to: "0x30fa9a3cf56931aceea42e28d35519a97d90aa67",
        data: "0x3790767d00000000000000000000000079a02482a880bce3f13e09da970dc34db4cd24d1000000000000000000000000a565aa0677c387e0b599e6035a44438f596a2fc5ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        value: "0x0",
        skipRevert: true,
        callbackHash:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      },
    ];
    const bundle = morpho.createWithdrawCollateralBundle(
      "2137455462655345174",
      testOnBehalf
    );
    expect(JSON.stringify(bundle)).toBe(JSON.stringify(expectedBundle));
  });

  test("fetch max share price", async () => {
    const maxSharePrice = await morpho.getMaxSharePriceE27();
    console.log(maxSharePrice.toString());
    expect(maxSharePrice).toBeGreaterThan(0n);
  });
});

function getMethodSignatures(abi: any[]) {
  // Filter out non-function ABI items
  const functionAbi = abi.filter((item) => item.type === "function");

  // Generate signatures for each function
  const signatures = functionAbi.map((item) => {
    const signature = toFunctionSignature(item);
    const hash = keccak256(Buffer.from(signature, "utf8"));
    return `${item.name}: ${hash.slice(0, 10)}`;
  });

  return signatures;
}

const stringifyWithBigInt = (obj: any) => {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  });
};
