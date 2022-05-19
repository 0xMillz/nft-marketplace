const NftMarket = artifacts.require("NftMarket");
const { ethers } = require("ethers");

contract("NftMarket", (accounts) => {
  let _contract = null;
  const nftPrice = ethers.utils.parseEther("0.3").toString();

  describe("Mint token", () => {
    const tokenURI = "https://test.com";
    beforeEach(async () => {
      _contract = await NftMarket.new();

      await _contract.mintToken(tokenURI, nftPrice, {
        from: accounts[0],
      });
    });

    it("owner of the first token should be address[0]", async () => {
      const owner = await _contract.ownerOf(1);
      assert.equal(
        owner,
        accounts[0],
        "Owner of token is not matching address[0]"
      );
    });

    it("the first token should have the correct tokenURI", async () => {
      const actualURI = await _contract.tokenURI(1);
      assert.equal(actualURI, tokenURI, "Wrong tokenURI");
    });

    it("should not be possible to use an already used tokenURI", async () => {
      try {
        await _contract.mintToken(tokenURI, nftPrice, {
          from: accounts[0],
        });
      } catch (e) {
        assert(e, "token minted with previously used URI");
      }
    });

    it("correctly increments tokenId", async () => {
      await _contract.mintToken(tokenURI + "blahblah", nftPrice, {
        from: accounts[0],
      });
      const { tokenId } = await _contract.getNftItem(2);
      assert.equal(tokenId, 2, "Wrong token id");
    });

    it("correctly increments _listedItems", async () => {
      await _contract.mintToken(tokenURI + "blahblah1", nftPrice, {
        from: accounts[0],
      });
      const count = await _contract.listedItemsCount();
      assert.equal(count, 2, "Wrong count");
    });
  });
});
