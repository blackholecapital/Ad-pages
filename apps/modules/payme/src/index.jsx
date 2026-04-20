import PaymeModuleApp from "./App.jsx";

export { PaymeModuleApp };
export {
  transferUsdc,
  formatUsdc,
  toUsdcAtomicUnits,
  fromUsdcAtomicUnits,
} from "./services/usdcTransfer.js";

const paymeModuleStub = {
  name: "usdc.xyz-labs.xyz",
  status: "entrypoints-aligned",
};

export default paymeModuleStub;
