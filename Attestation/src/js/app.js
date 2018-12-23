App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,
  result: '',

  init: function() {
    console.log("Initializing Web3");
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    console.log("Web3 initialized");
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Attestation.json", function(attestation) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Attestation = TruffleContract(attestation);
      // Connect provider to interact with contract
      App.contracts.Attestation.setProvider(App.web3Provider);

      console.log("Fetched Contract");
      return App.render();
    });
  },

  //listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Elections.deployed().then(function(instance) {
      /**
       * @argument: {} --> Solidity allows filters to be passed to events, this object is used to specify the filters
       * @argument: {fromBlock:0 , toBlock:'latest' } --> Metadata to the event
       *                                              --> Means we want to subscribe to events on the entire blockchain
       */
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        //watch() is used to subscribe to the event

        console.log("event triggered", event);
        //Reload when a new vote is casted
        App.render();
      });
    });
  },

  render: function() {
    var attestationInstance;
    console.log("render() called");

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
        $("#result").html(App.result);
      }
    });

    // Load contract data
    App.contracts.Attestation.deployed().then(function(instance) {
      attestationInstance = instance;
      console.log(attestationInstance);
      return attestationInstance.studentCount();
    }).then(function(studentCount) {
      $('#studentCount').text(studentCount);
      return attestationInstance.universityCount();
    }).then(function(universityCount) {
      $('#universityCount').text(universityCount);
      return attestationInstance.degreeCount();
    }).then(function(degreeCount) {
      $('#degreeCount').text(degreeCount);
    });
  },

  addStudent: function() {
    var name = $('#studentName').val();
    var dob = $('#studentDob').val();
    var email = $('#studentEmail').val();
    var gpa = $('#studentGPA').val();
    var uniId = $('#studentuniID').val();
    var degName = $('#studentDN').val();
    var courseName = $('#studentCN').val();
    var passYear = $('#studentPassYear').val();
    App.contracts.Attestation.deployed().then(function(instance) {
      return instance.addStudent(name, dob, email, gpa, uniId, degName, courseName, passYear, { from: App.account });
    }).then(function(result) {
      console.log(result.tx);
      App.result = "Transaction Hash: " + result.tx;
      App.render();
    }).catch(function(err) {
      console.error(err);
    });
  },
  
  addUniversity: function() {
    var name = $('#universityName').val();
    console.log(name);
    var loc = $('#universityLoc').val();
    console.log(loc);
    var email = $('#universityEmail').val();
    console.log(email);
    App.contracts.Attestation.deployed().then(function(instance) {
      return instance.addUniversity(name, loc, email, { from: App.account });
    }).then(function(result) {
      console.log(result.tx);
      App.result = result.tx;
      App.render();
    }).catch(function(err) {
      console.error(err);
    });
  },

  verifyDegree: function() {
    var id = $('#degreeId').val();
    console.log(id);
    App.contracts.Attestation.deployed().then(function(instance) {
      return instance.verifyDegree(id, { from: App.account });
    }).then(function(result) {
      console.log(result.tx);
      App.result = result.tx;
      App.render();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
