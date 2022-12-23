const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { localChains } = require("../helper-hardhat-config")

const ItemPrice = ethers.utils.parseEther("1")
const itemsLessPrice = ethers.utils.parseEther("0.3")
const SellerPan = "ABC"
const BuyerPan = "XYZ"
const ItemName = "Car"
const NewItemName = "Mobile"
const NewItemPrice = ethers.utils.parseEther("0.5")

!localChains.includes(network.name)
    ? describe.skip
    : describe("ApniDukan Test", async function () {
          let apniDukan, deployer, seller, buyer, ConnectedContract
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              accounts = await ethers.getSigners()
              otherThanAdminAccount = accounts[3]
              seller = accounts[1]
              buyer = accounts[2]
              await deployments.fixture(["apniDukan"])

              apniDukan = await ethers.getContract("ApniDukan", deployer)
              ConnectedContract = apniDukan.connect(otherThanAdminAccount)
          })

          describe("constructor", async function () {
              it("Initializes admin correctly", async function () {
                  const admin = await apniDukan.getAdmin()
                  assert.equal(deployer, admin)
              })
          })

          describe("addSeller", function () {
              it("only admin can add the owner", async function () {
                  await expect(
                      ConnectedContract.addSeller(SellerPan, seller.address)
                  ).to.be.revertedWith("Only admin")
              })

              it("admin adds seller, emits the event", async function () {
                  const tx = await apniDukan.addSeller(SellerPan, seller.address)
                  const txRec = await tx.wait(1)

                  // expected event : SellerAdded
                  await expect(tx).to.emit(apniDukan, "SellerAdded")

                  // Event emits following
                  assert.equal(txRec.events[0].args.sellerId, "0")
              })

              it("update mapping and list after adding seller by admin, seller gets permission by admin", async function () {
                  const tx = await apniDukan.addSeller(SellerPan, seller.address)
                  const txRec = await tx.wait(1)

                  const sellers = await apniDukan.getSellers()
                  // console.log(sellers[0])
                  assert.equal(SellerPan, sellers[0].sellerPan.toString())
                  assert(sellers[0].hasAdminPermission)
              })
          })

          describe("removeSeller", function () {
              it("only admin can remove the seller", async function () {
                  await apniDukan.addSeller(SellerPan, seller.address)
                  await expect(ConnectedContract.removeSeller(0)).to.be.revertedWith("Only admin")
              })

              it("only existing seller can be removed by admin", async function () {
                  await expect(apniDukan.removeSeller(0)).to.be.revertedWith(
                      "Seller does not exist"
                  )
              })

              it("admin remove the seller, emits the event and update boolean value for permission", async function () {
                  await apniDukan.addSeller(SellerPan, seller.address)

                  const tx = await apniDukan.removeSeller(0)

                  // expected event : SellerRemoved
                  await expect(tx).to.emit(apniDukan, "SellerRemoved")

                  const sellers = await apniDukan.getSellers()
                  assert(sellers[0].hasAdminPermission, false)
              })
          })

          describe("addItem", function () {
              it("only seller with permission of admin can add item", async function () {
                  await apniDukan.addSeller(SellerPan, seller.address)
                  await apniDukan.removeSeller(0)
                  const sellerConnectedContract = apniDukan.connect(seller)
                  await expect(
                      sellerConnectedContract.addItem(0, ItemName, ItemPrice)
                  ).to.be.revertedWith("Not have admin permission")
              })

              it("seller adds item and emits event", async function () {
                  await apniDukan.addSeller(SellerPan, seller.address)

                  const sellerConnectedContract = apniDukan.connect(seller)

                  const tx = await sellerConnectedContract.addItem(0, ItemName, ItemPrice)
                  const txRec = await tx.wait(1)

                  // expected event : ItemAdded
                  await expect(tx).to.emit(sellerConnectedContract, "ItemAdded")

                  // Event emits following
                  assert.equal(txRec.events[0].args.sellerId, "0")
                  assert.equal(txRec.events[0].args.itemId, "0")
              })
          })

          describe("updateItem", function () {
              it("only seller with permission of admin can update item", async function () {
                  await apniDukan.addSeller(SellerPan, seller.address)
                  await apniDukan.removeSeller(0)
                  const sellerConnectedContract = apniDukan.connect(seller)
                  await expect(
                      sellerConnectedContract.updateItem(0, 0, ItemName, ItemPrice)
                  ).to.be.revertedWith("Not have admin permission")
              })

              it("seller updates item and emits event", async function () {
                  await apniDukan.addSeller(SellerPan, seller.address)

                  const sellerConnectedContract = apniDukan.connect(seller)

                  await sellerConnectedContract.addItem(0, ItemName, ItemPrice)

                  const tx = await sellerConnectedContract.updateItem(
                      0,
                      0,
                      NewItemName,
                      NewItemPrice
                  )
                  const txRec = await tx.wait(1)

                  // expected event : ItemAdded
                  await expect(tx).to.emit(sellerConnectedContract, "ItemUpdated")

                  // Event emits following
                  //console.log(txRec.events[0])
                  assert.equal(txRec.events[0].args.sellerId, "0")
                  assert.equal(txRec.events[0].args.itemId, "0")
              })
          })

          describe("buyItem", function () {
              it("seller must have admin permission", async function () {
                  await apniDukan.addSeller(SellerPan, seller.address)
                  await apniDukan.removeSeller(0)
                  const sellerConnectedContract = apniDukan.connect(seller)
                  await expect(
                      sellerConnectedContract.addItem(0, ItemName, ItemPrice)
                  ).to.be.revertedWith("Not have admin permission")
              })

              it("reverts when price is less than item's price", async function () {
                  await apniDukan.addSeller(SellerPan, seller.address)

                  const sellerConnectedContract = apniDukan.connect(seller)

                  await sellerConnectedContract.addItem(0, ItemName, ItemPrice)

                  await expect(
                      ConnectedContract.buyItem(BuyerPan, 0, 0, {
                          value: itemsLessPrice,
                      })
                  ).to.be.revertedWith("Send enough to buy item")
              })

              it("price should greater or equal to items price", async function () {
                  await apniDukan.addSeller(SellerPan, seller.address)

                  const sellerConnectedContract = apniDukan.connect(seller)

                  await sellerConnectedContract.addItem(0, ItemName, ItemPrice)

                  const tx = await ConnectedContract.buyItem(BuyerPan, 0, 0, {
                      value: ItemPrice,
                  })
                  const txRec = await tx.wait(1)
              })
          })
      })
