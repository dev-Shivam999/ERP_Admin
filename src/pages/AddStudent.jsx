import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { createStudent, updateStudent, fetchStudents, fetchStudentById, clearSelectedStudent } from '../store/slices/studentsSlice';
import { fetchClasses, fetchSectionsByClass } from '../store/slices/academicSlice';
import { toast } from 'react-hot-toast';

const AddStudent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams(); // For edit mode
    const { selectedStudent, loading: loadingStudent } = useSelector((state) => state.students);
    const { classes, sectionsByClass, loading: loadingAcademic } = useSelector((state) => state.academic);
    const { installmentPlans } = useSelector((state) => state.fees);
    const loading = loadingStudent || loadingAcademic;
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        joiningClassId: '',
        currentClassId: '',
        sectionId: '',
        stream: '', // For class 11/12
        category: 'general',
        religion: 'hindu',
        fatherName: '',
        motherName: '',
        guardianName: '',
        guardianRelation: '',
        phone: '',
        alternatePhone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        dateOfBirth: '',
        gender: 'male',
        bloodGroup: '',
        aadharNumber: '',
        previousSchool: '',
        transferCertificateNo: '',
        admissionDate: new Date().toISOString().split('T')[0],
        isGovtScholarship: false,
        scholarshipType: '',
        transportRequired: false,
        hostelRequired: false,
        paymentMode: 'monthly', // 'monthly' or 'installment'
        installmentPlanId: '',
    });

    const streams = ['Science', 'Commerce', 'Arts/Humanities'];

    // Load academic data
    useEffect(() => {
        dispatch(fetchClasses());
    }, [dispatch]);

    // Load sections when class changes
    useEffect(() => {
        if (formData.currentClassId) {
            dispatch(fetchSectionsByClass(formData.currentClassId));
        }
    }, [dispatch, formData.currentClassId]);

    // Get current sections
    const currentSections = sectionsByClass[formData.currentClassId] || [];

    // Load student data in edit mode
    useEffect(() => {
        if (isEditMode) {
            dispatch(fetchStudentById(id));
        } else {
            dispatch(clearSelectedStudent());
        }
    }, [isEditMode, id, dispatch]);

    // Fill form when selectedStudent is loaded
    useEffect(() => {
        if (isEditMode && selectedStudent && selectedStudent.id === id) {
            setFormData({
                firstName: selectedStudent.first_name || '',
                middleName: selectedStudent.middle_name || '',
                lastName: selectedStudent.last_name || '',
                joiningClassId: selectedStudent.admission_class_id || '',
                currentClassId: selectedStudent.current_class_id || '',
                sectionId: selectedStudent.section_id || '',
                stream: selectedStudent.stream || '',
                category: selectedStudent.category || 'general',
                religion: selectedStudent.religion || 'hindu',
                fatherName: selectedStudent.father_name || '',
                motherName: selectedStudent.mother_name || '',
                guardianName: selectedStudent.guardian_name || '',
                guardianRelation: selectedStudent.guardian_relation || '',
                phone: selectedStudent.phone || '',
                alternatePhone: selectedStudent.alternate_phone || '',
                email: selectedStudent.email || '',
                address: selectedStudent.address || '',
                city: selectedStudent.city || '',
                state: selectedStudent.state || '',
                pincode: selectedStudent.pincode || '',
                dateOfBirth: selectedStudent.date_of_birth?.split('T')[0] || '',
                gender: selectedStudent.gender || 'male',
                bloodGroup: selectedStudent.blood_group || '',
                aadharNumber: selectedStudent.aadhar_number || '',
                previousSchool: selectedStudent.previous_school || '',
                transferCertificateNo: selectedStudent.transfer_certificate_no || '',
                admissionDate: selectedStudent.admission_date?.split('T')[0] || '',
                isGovtScholarship: selectedStudent.is_govt_scholarship || false,
                scholarshipType: selectedStudent.scholarship_type || '',
                transportRequired: selectedStudent.transport_required || false,
                hostelRequired: selectedStudent.hostel_required || false,
                paymentMode: selectedStudent.installment_plan_id ? 'installment' : 'monthly',
                installmentPlanId: selectedStudent.installment_plan_id || '',
            });

            // If parents list exists, map names
            if (selectedStudent.parents && selectedStudent.parents.length > 0) {
                const father = selectedStudent.parents.find(p => p.relationship === 'father');
                const mother = selectedStudent.parents.find(p => p.relationship === 'mother');
                const guardian = selectedStudent.parents.find(p => p.relationship === 'guardian');

                if (father) setFormData(prev => ({ ...prev, fatherName: `${father.first_name} ${father.last_name || ''}`.trim() }));
                if (mother) setFormData(prev => ({ ...prev, motherName: `${mother.first_name} ${mother.last_name || ''}`.trim() }));
                if (guardian) setFormData(prev => ({
                    ...prev,
                    guardianName: `${guardian.first_name} ${guardian.last_name || ''}`.trim(),
                    guardianRelation: guardian.guardian_relation || ''
                }));
            }
        }
    }, [isEditMode, selectedStudent, id]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        if (name === 'currentClassId') {
            const selectedClass = classes.find(c => c.id === value);
            const isSenior = selectedClass?.name?.includes('11') || selectedClass?.name?.includes('12');

            setFormData(prev => ({
                ...prev,
                [name]: val,
                sectionId: '', // Reset section when class changes
                stream: isSenior ? prev.stream : '' // Reset stream if not 11/12
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: val
            }));
        }
    };

    const selectedClassObj = classes.find(c => c.id === formData.currentClassId);
    const isHigherClass = selectedClassObj?.name?.includes('11') || selectedClassObj?.name?.includes('12');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.firstName || !formData.currentClassId) {
            toast.error('First Name and Current Class are required');
            return;
        }

        const selectedClass = classes.find(c => c.id === formData.currentClassId);
        const selectedJoiningClass = classes.find(c => c.id === formData.joiningClassId);
        const selectedSection = currentSections.find(s => s.id === formData.sectionId);

        // Map form data to API format
        const payload = {
            ...formData,
            currentClass: selectedClass?.name,
            joiningClass: selectedJoiningClass?.name || selectedClass?.name,
            sectionName: selectedSection?.name || 'A',
            className: selectedClass?.name,
        };

        if (isEditMode) {
            const result = await dispatch(updateStudent({ id, data: payload }));
            if (!result.error) {
                toast.success('Student updated successfully!');
                navigate('/students');
            } else {
                toast.error(result.payload?.message || 'Failed to update student');
            }
        } else {
            const result = await dispatch(createStudent(payload));
            if (!result.error) {
                toast.success(`Student created! Admission No: ${result.payload?.admissionNumber}`);
                navigate('/students');
            } else {
                toast.error(result.payload?.message || result.error?.message || 'Failed to create student');
            }
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <button className="btn btn-outline" onClick={() => navigate('/students')}>
                    <ArrowLeft size={20} />
                </button>
                <h2 style={{ margin: 0 }}>{isEditMode ? 'Edit Student' : 'Add New Student'}</h2>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-header">
                        <h3 className="card-title">👤 Basic Information</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">First Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="First name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Middle Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="middleName"
                                    value={formData.middleName}
                                    onChange={handleInputChange}
                                    placeholder="Middle name"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Last name"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Date of Birth</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Gender</label>
                                <select
                                    className="form-select"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Blood Group</label>
                                <select
                                    className="form-select"
                                    name="bloodGroup"
                                    value={formData.bloodGroup}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Aadhar Number</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="aadharNumber"
                                    value={formData.aadharNumber}
                                    onChange={handleInputChange}
                                    placeholder="12-digit Aadhar"
                                    maxLength={12}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Academic Information */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-header">
                        <h3 className="card-title">📚 Academic Information</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Admission Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    name="admissionDate"
                                    value={formData.admissionDate}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Joining Class (When Joined)</label>
                                <select
                                    className="form-select"
                                    name="joiningClassId"
                                    value={formData.joiningClassId}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Current Class *</label>
                                <select
                                    className="form-select"
                                    name="currentClassId"
                                    value={formData.currentClassId}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Section</label>
                                <select
                                    className="form-select"
                                    name="sectionId"
                                    value={formData.sectionId}
                                    onChange={handleInputChange}
                                    required
                                    disabled={!formData.currentClassId}
                                >
                                    <option value="">Select Section</option>
                                    {currentSections.map(sec => (
                                        <option key={sec.id} value={sec.id}>{sec.name}</option>
                                    ))}
                                </select>
                            </div>

                            {isHigherClass && (
                                <div className="form-group">
                                    <label className="form-label">Stream *</label>
                                    <select
                                        className="form-select"
                                        name="stream"
                                        value={formData.stream}
                                        onChange={handleInputChange}
                                        required={isHigherClass}
                                        style={{ borderColor: isHigherClass && !formData.stream ? '#f59e0b' : undefined }}
                                    >
                                        <option value="">Select Stream</option>
                                        {streams.map(stream => (
                                            <option key={stream} value={stream}>{stream}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-select"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                >
                                    <option value="general">General</option>
                                    <option value="obc">OBC</option>
                                    <option value="sc">SC</option>
                                    <option value="st">ST</option>
                                    <option value="ews">EWS</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Religion</label>
                                <select
                                    className="form-select"
                                    name="religion"
                                    value={formData.religion}
                                    onChange={handleInputChange}
                                >
                                    <option value="hindu">Hindu</option>
                                    <option value="muslim">Muslim</option>
                                    <option value="christian">Christian</option>
                                    <option value="sikh">Sikh</option>
                                    <option value="jain">Jain</option>
                                    <option value="buddhist">Buddhist</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Previous School Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="previousSchool"
                                    value={formData.previousSchool}
                                    onChange={handleInputChange}
                                    placeholder="Previous school (if any)"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Transfer Certificate No.</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="transferCertificateNo"
                                    value={formData.transferCertificateNo}
                                    onChange={handleInputChange}
                                    placeholder="TC number from previous school"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="isGovtScholarship"
                                    checked={formData.isGovtScholarship}
                                    onChange={handleInputChange}
                                />
                                Government Scholarship Student
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="transportRequired"
                                    checked={formData.transportRequired}
                                    onChange={handleInputChange}
                                />
                                Transport Required
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="hostelRequired"
                                    checked={formData.hostelRequired}
                                    onChange={handleInputChange}
                                />
                                Hostel Required
                            </label>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                            <div className="form-group">
                                <label className="form-label">Fee Payment Mode</label>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="paymentMode"
                                            value="monthly"
                                            checked={formData.paymentMode === 'monthly'}
                                            onChange={handleInputChange}
                                        />
                                        Standard (Monthly)
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="paymentMode"
                                            value="installment"
                                            checked={formData.paymentMode === 'installment'}
                                            onChange={handleInputChange}
                                        />
                                        Installment Plan
                                    </label>
                                </div>
                            </div>

                            {formData.paymentMode === 'installment' && (
                                <div className="form-group animate-in fade-in slide-in-from-top-2">
                                    <label className="form-label">Select Installment Plan *</label>
                                    <select
                                        className="form-select"
                                        name="installmentPlanId"
                                        value={formData.installmentPlanId}
                                        onChange={handleInputChange}
                                        required={formData.paymentMode === 'installment'}
                                    >
                                        <option value="">Select Plan</option>
                                        {installmentPlans.map(plan => (
                                            <option key={plan.id} value={plan.id}>
                                                {plan.name} ({plan.details?.length || 0} installments)
                                            </option>
                                        ))}
                                    </select>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                        Fees will be generated based on this plan's percentages.
                                    </p>
                                </div>
                            )}
                        </div>

                        {formData.isGovtScholarship && (
                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label className="form-label">Scholarship Type</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="scholarshipType"
                                    value={formData.scholarshipType}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Post Matric, Pre Matric"
                                    style={{ maxWidth: '300px' }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Parent / Guardian Information */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-header">
                        <h3 className="card-title">👨‍👩‍👧 Parent / Guardian Information</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Father's Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="fatherName"
                                    value={formData.fatherName}
                                    onChange={handleInputChange}
                                    placeholder="Father's full name"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mother's Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="motherName"
                                    value={formData.motherName}
                                    onChange={handleInputChange}
                                    placeholder="Mother's full name"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Guardian Name (if different)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="guardianName"
                                    value={formData.guardianName}
                                    onChange={handleInputChange}
                                    placeholder="Guardian's full name"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Guardian Relation</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="guardianRelation"
                                    value={formData.guardianRelation}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Uncle, Grandfather"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Mobile Number</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Primary mobile number"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Alternate Number</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    name="alternatePhone"
                                    value={formData.alternatePhone}
                                    onChange={handleInputChange}
                                    placeholder="Alternate number"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Parent's email (optional)"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-header">
                        <h3 className="card-title">📍 Address</h3>
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <label className="form-label">Full Address</label>
                            <textarea
                                className="form-input"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="House No., Street, Village/Town"
                                rows={2}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">City / District</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="City or District"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">State</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    placeholder="State"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Pincode</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleInputChange}
                                    placeholder="6-digit pincode"
                                    maxLength={6}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-outline" onClick={() => navigate('/students')}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <Save size={18} /> {loading ? 'Saving...' : (isEditMode ? 'Update Student' : 'Save Student')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddStudent;
