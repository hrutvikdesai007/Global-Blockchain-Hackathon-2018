pragma solidity ^0.4.19;

/**
 * Smart contract for the student attestation
 */
contract Attestation {
    /**
     * Number of universities registered on the N/w.
     */
    uint public universityCount;
    /**
     * Represents a single university
     */
    struct University {
        uint id;
        string name;
        string location;
        string email;
        address universityAddr;
        bool isInit;
    }

    /**
     * Number of students registered on the N/w.
     */
    uint public studentCount;
    /**
     * Represents a single student
     */
    struct Student {
        uint id;
        string name;
        string dob;
        string email;
        string gpa;
        uint universityId;
        address studentAddr;
        bool isInit;
    }

    /**
     * Number of degrees awarded by the N/w.
     */
    uint public degreeCount;
    /**
     * Represents a single degree.
     */
    struct Degree {
        uint id;
        uint studentId;
        uint universityId;
        bool verified;
        string degreeName;
        string courseName;
        uint passYear;
    }

    /**
     * Maps an Ethereum account to a particular Student
     */
    mapping(address => Student) public students;
    /**
     * Maps an Ethereum account to a particular University
     */
    mapping(address => University) public universities;
    /**
     * Maps a UniversityId to an Ethereum account
     */
    mapping(uint => address) private helperMapping;
    /**
     * Maps a Degree id to a particular Degree
     */
    mapping(uint => Degree) public degrees;

    /**
     * Constructor to initialize count variables to 0.
     */
    constructor() public {
        universityCount = 0;
        studentCount = 0;
        degreeCount = 0;
    }

    /**
     * Adds a new university on the N/w and updates the count.
     */
    function addUniversity(string name, string location, string email) public {
        require(!universities[msg.sender].isInit, "Address already has a university registered.");
        require(!students[msg.sender].isInit, "Address cannot have both student and university registration.");
        universityCount++;
        helperMapping[universityCount] = msg.sender;
        universities[msg.sender] = University(
            universityCount, name, location, email, msg.sender, true
        );
    }

    /**
     * Adds a new student on the N/w and updates the count.
     */
    function addStudent(string name, string dob, string email, string gpa, uint universityId, string dn, string cn, uint passYear) public {
        require(!students[msg.sender].isInit, "Address already has a student registered.");
        require(!universities[msg.sender].isInit, "Address cannot have both student and university registration.");
        studentCount++;
        students[msg.sender] = Student(
            studentCount, name, dob, email, gpa, universityId, msg.sender, true
        );
        addDegree(studentCount, universityId, dn, cn, passYear);
    }

    /**
     * Adds a new degree that is awaiting approval
     */
    function addDegree(uint studentId, uint universityId, string degreeName, string courseName, uint passYear) private {
        degreeCount++;
        degrees[degreeCount] = Degree(
            degreeCount, studentId, universityId, false, degreeName, courseName, passYear
        );
    }

    /**
     * Approves a pending degree by setting the verified flag to true.
     */
    function verifyDegree(uint degreeId) public {
        require(msg.sender == helperMapping[degrees[degreeId].universityId], "Not authenticated to verify this degree.");
        require(!degrees[degreeId].verified, "Degree is already verified!");
        require(degreeId > 0 && degreeId <= degreeCount, "Please pass valid degreeId");
        degrees[degreeId].verified = true;
    }
}