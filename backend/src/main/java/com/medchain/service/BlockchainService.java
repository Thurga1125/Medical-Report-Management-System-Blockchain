package com.medchain.service;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Bool;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Bytes32;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.RawTransaction;
import org.web3j.crypto.TransactionEncoder;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.utils.Numeric;

/** Talks to the MedicalRecordRegistry smart contract on an Ethereum network via web3j. */
@Service
public class BlockchainService {

    public record AnchorReceipt(String txHash, long blockNumber) {}

    public record OnChainAnchor(boolean exists, String hash, String recordType, String submitter, long timestamp) {}

    private final Web3j web3j;
    private final Credentials credentials;
    private final String contract;
    private final long chainId;

    public BlockchainService(@Value("${app.chain.rpc-url}") String rpcUrl,
                             @Value("${app.chain.private-key}") String privateKey,
                             @Value("${app.chain.contract-address}") String contract,
                             @Value("${app.chain.chain-id}") long chainId) {
        this.web3j = Web3j.build(new HttpService(rpcUrl));
        this.credentials = Credentials.create(privateKey);
        this.contract = contract;
        this.chainId = chainId;
    }

    /** Writes the record fingerprint to the chain and waits until it is mined. */
    public AnchorReceipt anchor(String recordId, String hashHex, String recordType) {
        try {
            Function fn = new Function("anchorRecord",
                    Arrays.asList(new Utf8String(recordId), new Bytes32(Numeric.hexStringToByteArray(hashHex)),
                            new Utf8String(recordType)),
                    List.of());
            BigInteger nonce = web3j.ethGetTransactionCount(credentials.getAddress(),
                    DefaultBlockParameterName.PENDING).send().getTransactionCount();
            BigInteger gasPrice = web3j.ethGasPrice().send().getGasPrice();
            RawTransaction raw = RawTransaction.createTransaction(nonce, gasPrice, BigInteger.valueOf(500_000),
                    contract, BigInteger.ZERO, FunctionEncoder.encode(fn));
            byte[] signed = TransactionEncoder.signMessage(raw, chainId, credentials);
            EthSendTransaction sent = web3j.ethSendRawTransaction(Numeric.toHexString(signed)).send();
            if (sent.hasError()) {
                throw new IllegalStateException("Blockchain rejected transaction: " + sent.getError().getMessage());
            }
            String txHash = sent.getTransactionHash();
            for (int i = 0; i < 60; i++) {
                Optional<TransactionReceipt> receipt = web3j.ethGetTransactionReceipt(txHash).send().getTransactionReceipt();
                if (receipt.isPresent()) {
                    if (!receipt.get().isStatusOK()) {
                        throw new IllegalStateException("Blockchain transaction reverted");
                    }
                    return new AnchorReceipt(txHash, receipt.get().getBlockNumber().longValue());
                }
                Thread.sleep(500);
            }
            throw new IllegalStateException("Timed out waiting for transaction " + txHash);
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Blockchain unavailable: " + e.getMessage(), e);
        }
    }

    public OnChainAnchor getAnchor(String recordId) {
        try {
            Function fn = new Function("getAnchor", List.of(new Utf8String(recordId)),
                    Arrays.asList(new TypeReference<Bool>() {}, new TypeReference<Bytes32>() {},
                            new TypeReference<Utf8String>() {}, new TypeReference<org.web3j.abi.datatypes.Address>() {},
                            new TypeReference<Uint256>() {}));
            String data = web3j.ethCall(Transaction.createEthCallTransaction(credentials.getAddress(), contract,
                    FunctionEncoder.encode(fn)), DefaultBlockParameterName.LATEST).send().getValue();
            List<Type> out = FunctionReturnDecoder.decode(data, fn.getOutputParameters());
            boolean exists = (Boolean) out.get(0).getValue();
            return new OnChainAnchor(exists, Numeric.toHexString((byte[]) out.get(1).getValue()),
                    (String) out.get(2).getValue(), (String) out.get(3).getValue(),
                    ((BigInteger) out.get(4).getValue()).longValue());
        } catch (Exception e) {
            throw new IllegalStateException("Blockchain unavailable: " + e.getMessage(), e);
        }
    }
}
