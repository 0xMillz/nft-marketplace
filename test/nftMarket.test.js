const NftMarket = artifacts.require("NftMarket");
const { ethers } = require("ethers");

contract("NftMarket", (accounts) => {
  let _contract = null;
  const _nftPrice = ethers.utils.parseEther("0.3").toString();
  const _listingPrice = ethers.utils.parseEther("0.025").toString();

  describe("Mint token", () => {
    const tokenURI = "https://test.com";
    beforeEach(async () => {
      _contract = await NftMarket.new();

      await _contract.mintToken(tokenURI, _nftPrice, {
        from: accounts[0],
        value: _listingPrice,
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
        await _contract.mintToken(tokenURI, _nftPrice, {
          from: accounts[0],
          value: _listingPrice,
        });
      } catch (e) {
        assert(e, "token minted with previously used URI");
      }
    });

    it("correctly increments tokenId", async () => {
      await _contract.mintToken(tokenURI + "blahblah", _nftPrice, {
        from: accounts[0],
        value: _listingPrice,
      });
      const { tokenId } = await _contract.getNftItem(2);
      assert.equal(tokenId, 2, "Wrong token id");
    });

    it("correctly increments _listedItems", async () => {
      await _contract.mintToken(tokenURI + "blahblah1", _nftPrice, {
        from: accounts[0],
        value: _listingPrice,
      });
      const count = await _contract.listedItemsCount();
      assert.equal(count, 2, "Wrong count");
    });

    it("correctly creates an NftItem", async () => {
      await _contract.mintToken(tokenURI + "blahblah1", _nftPrice, {
        from: accounts[0],
        value: _listingPrice,
      });
      const nftItem = await _contract.getNftItem(2);
      assert.equal(nftItem.tokenId, 2, "Wrong tokenId");
      assert.equal(nftItem.price, _nftPrice, "Wrong price");
      assert.equal(nftItem.creator, accounts[0], "Wrong creator");
      assert.equal(nftItem.isListed, true, "Wrong isListed");
    });
  });
});
