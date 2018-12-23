var Attestation = artifacts.require("./Attestation.sol");

contract("Attestation", function(accounts) {
    var instance;

    it("initializes with university count 0", () => {
        return Attestation.deployed().then((i) => {
            return i.universityCount();
        }).then((uniCount) => {
            assert.equal(uniCount, 0);
        });
    });

    it("initializes with student count 0", () => {
        return Attestation.deployed().then((i) => {
            return i.studentCount();
        }).then((sCount) => {
            assert.equal(sCount, 0);
        });
    });

    it("initializes with degree count 0", () => {
        return Attestation.deployed().then((i) => {
            return i.degreeCount();
        }).then((dCount) => {
            assert.equal(dCount, 0);
        });
    });

    it("adds university correctly", () => {
        return Attestation.deployed().then(function(i) {
            instance = i;
            instance.addUniversity("University 1", "Mumbai", "testemail1", { from: accounts[0] });
            return instance.universities(accounts[0]);
        }).then(function(university) {
            assert.equal(university[0], 1, "contains correct id");
            assert.equal(university[1], "University 1", "contains the correct name");
            assert.equal(university[2], "Mumbai", "contains the correct location");
            assert.equal(university[3], "testemail1", "contains the correct email id");
            assert.equal(university[5], true, "isInit set to true");
        });
    });

    it("adds student and associated degree correctly", () => {
        return Attestation.deployed().then(function(i) {
            instance = i;
            instance.addStudent("Student 1", "08-05-1999", "studenttestemail1", "9.3", 1, "B.Tech", "Computer Science", 2018, { from: accounts[1] });
            return instance.students(accounts[1]);
        }).then(function(student) {
            assert.equal(student[0], 1, "contains correct id");
            assert.equal(student[1], "Student 1", "contains the correct name");
            assert.equal(student[2], "08-05-1999", "contains the correct dob");
            assert.equal(student[3], "studenttestemail1", "contains the correct email id");
            assert.equal(student[4], "9.3", "contains the correct gpa");
            assert.equal(student[5], 1, "contains the correct associated university id");
            assert.equal(student[7], true, "isInit correctly set to true");
            return instance.degrees(1);
        }).then(function(degree) {
            assert.equal(degree[0], 1, "contains the correct degree id");
            assert.equal(degree[1], 1, "contains the correct student id");
            assert.equal(degree[2], 1, "contains the correct associated university id");
            assert.equal(degree[3], false, "correctly sets the verified flag.");
            assert.equal(degree[4], "B.Tech", "contains the correct degree name");
            assert.equal(degree[5], "Computer Science", "contains the correct course name");
            assert.equal(degree[6], 2018, "contains the correct pass year");
        });
    });

    it("verifies the degree correctly", () => {
        return Attestation.deployed().then(function(i) {
            instance = i;
            instance.verifyDegree(1);
            return instance.degrees(1);
        }).then(function(degree) {
            assert.equal(degree[3], true, "correctly verifies the degree");
        });
    });

    it("does not allow same account to register as a university twice", () => {
        return Attestation.deployed().then(function(i) {
            instance = i;
            instance.addUniversity("University 2", "Delhi", "testemail2", { from: accounts[0] });
        }).then(assert.fail).catch(function(error) {
            assert(error.message);
            instance.addUniversity("University 2", "Delhi", "testemail2", { from: accounts[2] });
            return instance.universityCount();
        }).then(function(uniCount) {
            assert.equal(uniCount, 2, "increments university count correctly");
        });
    });

    it("does not allow same account to register as a student twice", () => {
        return Attestation.deployed().then(function(i) {
            instance = i;
            instance.addStudent("Student 1", "08-05-1999", "studenttestemail1", "9.3", 1, "M.Tech", "Information Technology", 2018, { from: accounts[1] });
        }).then(assert.fail).catch(function(error) {
            assert(error.message);
            instance.addStudent("Student 1", "08-05-1999", "studenttestemail1", "9.3", 1, "M.Tech", "Information Technology", 2018, { from: accounts[3] });
            return instance.studentCount();
        }).then(function(sCount) {
            assert.equal(sCount, 2, "increments student count correctly");
            return instance.degreeCount();
        }).then(function(dCount) {
            assert.equal(dCount, 2, "increments degree count correctly");
        });
    });

    it("does not allow registered account to register as someone else", () => {
        return Attestation.deployed().then(function(i) {
            instance = i;
            instance.addUniversity("University 3", "Bangalore", "testemail3", { from: accounts[1] });
        }).then(assert.fail).catch(function(error) {
            assert(error.message);
            instance.addStudent("Student 3", "08-05-1999", "studenttestemail3", "9.3", 1, "M.Tech", "Information Technology", 2018, { from: accounts[0] });    
        }).then(assert.fail).catch(function(error) {
            assert(error.message);
            return instance.studentCount();
        }).then(function(sCount) {
            assert.equal(sCount, 2, "studentCount maintained correctly");
            return instance.universityCount();
        }).then(function(uCount) {
            assert.equal(uCount, 2, "universityCount maintained correctly");
            return instance.degreeCount();
        }).then(function(dCount) {
            assert.equal(dCount, 2, "degreeCount maintained correctly");
        });
    });

});