Feature: Release related tests
  Background: Setup local blockchain, bootstraps and nodes
    Given the blockchains are set up
    And 1 bootstrap is running

  @release
  Scenario: Publishing a valid assertion on both blockchains
    Given I set R0 to be 1 on blockchain hardhat1:31337
    And I set R1 to be 2 on blockchain hardhat1:31337
    And I set R0 to be 1 on blockchain hardhat2:31337
    And I set R1 to be 2 on blockchain hardhat2:31337
    And I setup 4 nodes
    And I wait for 5 seconds

    I call Get Bid Suggestion on the node 2 with validPublish_1ForValidUpdate_1 on blockchain hardhat1:31337 with hashFunctionId 1 and scoreFunctionId 1
    And I call Info route on the node 2
    
    I call Get Bid Suggestion on the node 2 with validPublish_1ForValidUpdate_1 on blockchain hardhat2:31337 with hashFunctionId 1 and scoreFunctionId 1
    And I call Info route on the node 2
    
    I call Get Bid Suggestion on the node 2 with validPublish_1ForValidUpdate_1 on blockchain hardhat1:31337 with hashFunctionId 1 and scoreFunctionId 2
    And I call Info route on the node 2
    
    I call Get Bid Suggestion on the node 2 with validPublish_1ForValidUpdate_1 on blockchain hardhat2:31337 with hashFunctionId 1 and scoreFunctionId 2
    And I call Info route on the node 2
    
    I call Get Bid Suggestion on the node 2 with validPublish_1ForValidUpdate_1 on blockchain hardhat1:31337
    And I call Info route on the node 2
    
    I call Get Bid Suggestion on the node 2 with validPublish_1ForValidUpdate_1 on blockchain hardhat2:31337
    And I call Info route on the node 2