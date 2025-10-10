import PageName from '../../../components/PageName';
import SkeletonLoader from '../../../components/SkeletonLoader/SkeletonLoader';
import useDateFormat from '../../../../hooks/useDateFormat';
import useDashboardData from './useDashboardData';
import { registrationRequirements } from './registrationRequirements';

/**
 * Dashboard Component - Main trainee dashboard
 * Displays enrolled courses, pending payments, registration requirements, and statistics
 * 
 * This component acts as a pure presentation layer - all logic and API calls
 * are handled by the useDashboardData custom hook
 */
const Dashboard = () => {
    const { formatDateToReadable } = useDateFormat();
    
    // Get all dashboard data and functions from custom hook
    const {
        isLoading,
        enrolledCourses,
        pendingPayments,
        userStats,
        registrationStatus,
        error,
        getStatusColor,
        getPaymentStatusColor,
        navigateToCourseList,
        navigateToEnrollment,
        retryFetch
    } = useDashboardData();

    return (
        <>
            <PageName pageName={[
                {
                    'name' : 'Dashboard',
                    'last' : true,
                    'address' : '/trainee/dashboard'
                }
            ]}/>

            {
                isLoading
                    ? <SkeletonLoader />
                    : error
                    ? <section className="content">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body text-center py-5">
                                            <i className="fas fa-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
                                            <h5 className="mt-3 mb-2 text-danger">Error Loading Dashboard</h5>
                                            <p className="text-muted mb-4">{error}</p>
                                            <button
                                                onClick={retryFetch}
                                                className="btn btn-primary"
                                            >
                                                <i className="fas fa-redo mr-2"></i>
                                                Retry
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    : <section className="content">
                <div className="container-fluid">
                    <div className="row fade-up">
                                {/* Welcome Header */}
                                <div className="col-xl-12 mb-4">
                                    <div className="card shadow-sm border-0" style={{ 
                                        background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
                                        color: 'white'
                                    }}>
                                        <div className="card-body p-4">
                                            <div className="row align-items-center">
                                                <div className="col-md-8">
                                                    <h4 className="mb-2 font-weight-bold">
                                                        <i className="fas fa-tachometer-alt mr-2"></i>
                                                        Welcome to Your Dashboard
                                                    </h4>
                                                    <p className="mb-0" style={{ fontSize: '14px', opacity: 0.9 }}>
                                                        Track your courses, manage payments, and complete your registration requirements
                                                    </p>
                                                </div>
                                                <div className="col-md-4 text-md-right">
                                                    <div className="d-flex flex-column align-items-md-end">
                                                        <span className="badge badge-light mb-2" style={{ fontSize: '12px', padding: '0.5rem 1rem' }}>
                                                            <i className="fas fa-graduation-cap mr-1"></i>
                                                            {userStats.total_courses} Total Courses
                                                        </span>
                                                        <span className="badge badge-success" style={{ fontSize: '12px', padding: '0.5rem 1rem' }}>
                                                            <i className="fas fa-check-circle mr-1"></i>
                                                            {userStats.completed_courses} Completed
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Statistics Cards */}
                                <div className="col-xl-3 col-md-6 mb-4">
                                    <div className="card border-0 h-100" style={{ 
                                        backgroundColor: '#ffffff',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
                                        borderRadius: '8px',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0px)';
                                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)';
                                    }}>
                                        <div className="card-body p-4">
                                            <div className="d-flex align-items-start justify-content-between">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <div className="rounded-circle d-flex align-items-center justify-content-center mr-3" 
                                                             style={{ 
                                                                 width: '40px', 
                                                                 height: '40px', 
                                                                 backgroundColor: '#e3f2fd',
                                                                 color: '#1976d2'
                                                             }}>
                                                            <i className="fas fa-play-circle" style={{ fontSize: '18px' }}></i>
                                                        </div>
                                                        <div>
                                                            <p className="mb-0 text-muted" style={{ 
                                                                fontSize: '14px', 
                                                                fontWeight: '500',
                                                                color: '#6b7280',
                                                                lineHeight: '1.4'
                                                            }}>
                                                                Ongoing Courses
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <h2 className="mb-0 font-weight-bold" style={{ 
                                                        fontSize: '28px',
                                                        color: '#1f2937',
                                                        lineHeight: '1.2'
                                                    }}>
                                                        {userStats.ongoing_courses}
                                                    </h2>
                                                    <p className="mb-0 text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>
                                                        Currently active
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-xl-3 col-md-6 mb-4">
                                    <div className="card border-0 h-100" style={{ 
                                        backgroundColor: '#ffffff',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
                                        borderRadius: '8px',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0px)';
                                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)';
                                    }}>
                                        <div className="card-body p-4">
                                            <div className="d-flex align-items-start justify-content-between">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <div className="rounded-circle d-flex align-items-center justify-content-center mr-3" 
                                                             style={{ 
                                                                 width: '40px', 
                                                                 height: '40px', 
                                                                 backgroundColor: '#fef3c7',
                                                                 color: '#d97706'
                                                             }}>
                                                            <i className="fas fa-clock" style={{ fontSize: '18px' }}></i>
                                                        </div>
                                                        <div>
                                                            <p className="mb-0 text-muted" style={{ 
                                                                fontSize: '14px', 
                                                                fontWeight: '500',
                                                                color: '#6b7280',
                                                                lineHeight: '1.4'
                                                            }}>
                                                                Pending Courses
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <h2 className="mb-0 font-weight-bold" style={{ 
                                                        fontSize: '28px',
                                                        color: '#1f2937',
                                                        lineHeight: '1.2'
                                                    }}>
                                                        {userStats.pending_courses}
                                                    </h2>
                                                    <p className="mb-0 text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>
                                                        Awaiting approval
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-xl-3 col-md-6 mb-4">
                                    <div className="card border-0 h-100" style={{ 
                                        backgroundColor: '#ffffff',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
                                        borderRadius: '8px',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0px)';
                                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)';
                                    }}>
                                        <div className="card-body p-4">
                                            <div className="d-flex align-items-start justify-content-between">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <div className="rounded-circle d-flex align-items-center justify-content-center mr-3" 
                                                             style={{ 
                                                                 width: '40px', 
                                                                 height: '40px', 
                                                                 backgroundColor: '#d1fae5',
                                                                 color: '#059669'
                                                             }}>
                                                            <i className="fas fa-check-circle" style={{ fontSize: '18px' }}></i>
                                                        </div>
                                                        <div>
                                                            <p className="mb-0 text-muted" style={{ 
                                                                fontSize: '14px', 
                                                                fontWeight: '500',
                                                                color: '#6b7280',
                                                                lineHeight: '1.4'
                                                            }}>
                                                                Total Paid
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <h2 className="mb-0 font-weight-bold" style={{ 
                                                        fontSize: '28px',
                                                        color: '#1f2937',
                                                        lineHeight: '1.2'
                                                    }}>
                                                        ₱{userStats.total_paid?.toLocaleString()}
                                                    </h2>
                                                    <p className="mb-0 text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>
                                                        Successfully processed
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-xl-3 col-md-6 mb-4">
                                    <div className="card border-0 h-100" style={{ 
                                        backgroundColor: '#ffffff',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
                                        borderRadius: '8px',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0px)';
                                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)';
                                    }}>
                                        <div className="card-body p-4">
                                            <div className="d-flex align-items-start justify-content-between">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <div className="rounded-circle d-flex align-items-center justify-content-center mr-3" 
                                                             style={{ 
                                                                 width: '40px', 
                                                                 height: '40px', 
                                                                 backgroundColor: '#fee2e2',
                                                                 color: '#dc2626'
                                                             }}>
                                                            <i className="fas fa-exclamation-triangle" style={{ fontSize: '18px' }}></i>
                                                        </div>
                                                        <div>
                                                            <p className="mb-0 text-muted" style={{ 
                                                                fontSize: '14px', 
                                                                fontWeight: '500',
                                                                color: '#6b7280',
                                                                lineHeight: '1.4'
                                                            }}>
                                                                Pending Payment
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <h2 className="mb-0 font-weight-bold" style={{ 
                                                        fontSize: '28px',
                                                        color: '#1f2937',
                                                        lineHeight: '1.2'
                                                    }}>
                                                        ₱{userStats.total_pending?.toLocaleString()}
                                                    </h2>
                                                    <p className="mb-0 text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>
                                                        Action required
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pending Payments Section */}
                                {pendingPayments.length > 0 && (
                                    <div className="col-xl-6 col-12 mb-4">
                                        <div className="card border-0 h-100" style={{ 
                                            backgroundColor: '#ffffff',
                                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
                                            borderRadius: '8px'
                                        }}>
                                            <div className="card-header bg-white border-0" style={{ 
                                                padding: '1.5rem 1.5rem 1rem 1.5rem',
                                                borderBottom: '1px solid #f3f4f6'
                                            }}>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="d-flex align-items-center">
                                                        <div className="rounded-circle d-flex align-items-center justify-content-center mr-3" 
                                                             style={{ 
                                                                 width: '32px', 
                                                                 height: '32px', 
                                                                 backgroundColor: '#fef3c7',
                                                                 color: '#d97706'
                                                             }}>
                                                            <i className="fas fa-exclamation-triangle" style={{ fontSize: '14px' }}></i>
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0 font-weight-bold" style={{ 
                                                                color: '#1f2937',
                                                                fontSize: '16px',
                                                                fontWeight: '600'
                                                            }}>
                                                                Pending Payments
                                                            </h6>
                                                            <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>
                                                                Action required for these courses
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="badge px-3 py-2" style={{ 
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        backgroundColor: '#f59e0b',
                                                        color: '#ffffff',
                                                        borderRadius: '16px'
                                                    }}>
                                                        {pendingPayments.length} {pendingPayments.length === 1 ? 'Payment' : 'Payments'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                {pendingPayments.map((payment, index) => (
                                                    <div key={payment.enrollment_id} 
                                                         className={`p-3 ${index !== pendingPayments.length - 1 ? 'border-bottom' : ''}`} 
                                                         style={{ 
                                                             backgroundColor: '#ffffff',
                                                             borderColor: '#f3f4f6'
                                                         }}>
                                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                                            <div className="flex-grow-1">
                                                                <h6 className="mb-1 font-weight-bold" style={{ 
                                                                    fontSize: '15px', 
                                                                    color: '#1f2937',
                                                                    fontWeight: '600',
                                                                    lineHeight: '1.4'
                                                                }}>
                                                                    {payment.course.name}
                                                                </h6>
                                                                <div className="d-flex align-items-center">
                                                                    <span className="badge mr-2" style={{ 
                                                                        fontSize: '10px',
                                                                        fontWeight: '500',
                                                                        backgroundColor: '#e5e7eb',
                                                                        color: '#374151',
                                                                        borderRadius: '4px',
                                                                        padding: '2px 8px'
                                                                    }}>
                                                                        {payment.course.acronym}
                                                                    </span>
                                                                    <small className="text-muted" style={{ fontSize: '12px' }}>
                                                                        {payment.course.duration}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                            <span className="badge" style={{ 
                                                                fontSize: '10px',
                                                                fontWeight: '600',
                                                                backgroundColor: '#fee2e2',
                                                                color: '#dc2626',
                                                                borderRadius: '12px',
                                                                padding: '4px 8px'
                                                            }}>
                                                                Unpaid
                                                            </span>
                                                        </div>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <span className="font-weight-bold" style={{ 
                                                                    fontSize: '18px',
                                                                    color: '#dc2626',
                                                                    fontWeight: '700'
                                                                }}>
                                                                    ₱{payment.course.total_fee.toLocaleString()}
                                                                </span>
                                                                <p className="mb-0 text-muted" style={{ fontSize: '11px' }}>
                                                                    Total amount due
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={navigateToCourseList}
                                                                className="btn"
                                                                style={{ 
                                                                    fontSize: '12px',
                                                                    fontWeight: '600',
                                                                    backgroundColor: '#dc2626',
                                                                    color: '#ffffff',
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    padding: '8px 16px',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#b91c1c';
                                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#dc2626';
                                                                    e.currentTarget.style.transform = 'translateY(0px)';
                                                                }}
                                                            >
                                                                <i className="fas fa-credit-card mr-2"></i>
                                                                Pay Now
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Registration Requirements Section */}
                                <div className={`col-xl-${pendingPayments.length > 0 ? '6' : '12'} col-12 mb-4`}>
                                    <div className="card border-0 h-100" style={{ 
                                        backgroundColor: '#ffffff',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
                                        borderRadius: '8px'
                                    }}>
                                        <div className="card-header bg-white border-0" style={{ 
                                            padding: '1.5rem 1.5rem 1rem 1.5rem',
                                            borderBottom: '1px solid #f3f4f6'
                                        }}>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-circle d-flex align-items-center justify-content-center mr-3" 
                                                         style={{ 
                                                             width: '32px', 
                                                             height: '32px', 
                                                             backgroundColor: '#dbeafe',
                                                             color: '#2563eb'
                                                         }}>
                                                        <i className="fas fa-clipboard-check" style={{ fontSize: '14px' }}></i>
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0 font-weight-bold" style={{ 
                                                            color: '#1f2937',
                                                            fontSize: '16px',
                                                            fontWeight: '600'
                                                        }}>
                                                            Registration Requirements
                                                        </h6>
                                                        <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>
                                                            Complete all requirements before registration
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="badge px-3 py-2" style={{ 
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    backgroundColor: registrationStatus ? '#10b981' : '#f59e0b',
                                                    color: '#ffffff',
                                                    borderRadius: '16px'
                                                }}>
                                                    {registrationStatus ? 'Complete' : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            <div className="p-3 border-bottom" style={{ backgroundColor: '#f8fafc' }}>
                                                <div className="d-flex align-items-start">
                                                    <div className="flex-shrink-0 mr-3">
                                                        <i className="fas fa-info-circle" style={{ 
                                                            fontSize: '16px', 
                                                            color: '#3b82f6',
                                                            marginTop: '2px'
                                                        }}></i>
                                                    </div>
                                                    <div>
                                                        <p className="mb-0" style={{ 
                                                            fontSize: '13px', 
                                                            color: '#374151',
                                                            lineHeight: '1.5',
                                                            fontWeight: '500'
                                                        }}>
                                                            <strong>Important:</strong> All requirements must be completed before you can submit your registration form.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="p-3">
                                                {registrationRequirements.map((requirement, index) => (
                                                    <div key={requirement.id} className="mb-3">
                                                        <div className="d-flex align-items-start">
                                                            <div className="flex-shrink-0 mr-3">
                                                                <div className="rounded-circle d-flex align-items-center justify-content-center" 
                                                                     style={{ 
                                                                         width: '28px', 
                                                                         height: '28px', 
                                                                         backgroundColor: '#f3f4f6',
                                                                         color: '#6b7280'
                                                                     }}>
                                                                    <span style={{ fontSize: '12px', fontWeight: '600' }}>
                                                                        {index + 1}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div className="d-flex align-items-start justify-content-between">
                                                                    <div className="flex-grow-1">
                                                                        <h6 className="mb-1 font-weight-bold" style={{ 
                                                                            fontSize: '14px', 
                                                                            color: '#1f2937',
                                                                            fontWeight: '600',
                                                                            lineHeight: '1.4'
                                                                        }}>
                                                                            {requirement.title}
                                                                            {requirement.required && <span className="text-danger ml-1">*</span>}
                                                                        </h6>
                                                                        <p className="mb-0 text-muted" style={{ 
                                                                            fontSize: '12px', 
                                                                            lineHeight: '1.5',
                                                                            color: '#6b7280'
                                                                        }}>
                                                                            {requirement.description}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex-shrink-0 ml-2">
                                                                        <i className={`${requirement.icon} text-muted`} style={{ fontSize: '16px' }}></i>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className="p-3 border-top" style={{ backgroundColor: '#f8fafc' }}>
                                                <button
                                                    onClick={navigateToEnrollment}
                                                    className="btn w-100"
                                                    style={{
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        backgroundColor: '#2563eb',
                                                        color: '#ffffff',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        padding: '12px 24px',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#1d4ed8';
                                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#2563eb';
                                                        e.currentTarget.style.transform = 'translateY(0px)';
                                                    }}
                                                >
                                                    <i className="fas fa-user-plus mr-2"></i>
                                                    Start Registration Process
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Enrolled Courses */}
                                <div className="col-xl-12 mb-4">
                                    <div className="card shadow-sm border-0">
                                        <div className="card-header bg-white border-bottom" style={{ padding: '1rem 1.5rem' }}>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>
                                                    <i className="fas fa-book-reader mr-2 text-primary"></i>
                                                    Recent Enrolled Courses
                                                </h6>
                                                <button
                                                    onClick={navigateToCourseList}
                                                    className="btn btn-outline-primary btn-sm"
                                                    style={{ fontSize: '12px', padding: '0.4rem 1rem' }}
                                                >
                                                    View All
                                                </button>
                                            </div>
                                        </div>
                                        <div className="card-body p-3">
                                            {enrolledCourses.length === 0 ? (
                                                <div className="text-center py-4">
                                                    <i className="fas fa-book text-muted" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
                                                    <h6 className="text-muted mt-3 mb-2">No Enrolled Courses</h6>
                                                    <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                                                        Start by enrolling in your first course
                                                    </p>
                                                    <button
                                                        onClick={navigateToEnrollment}
                                                        className="btn btn-primary btn-sm mt-3"
                                                    >
                                                        <i className="fas fa-plus mr-2"></i>
                                                        Enroll New Course
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="row">
                                                    {enrolledCourses.slice(0, 3).map((enrollment) => (
                                                        <div key={enrollment.enrollment_id} className="col-xl-4 col-md-6 mb-3">
                                                            <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: '#fafafa' }}>
                                                                <div className="card-body p-3">
                                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                                        <div className="flex-grow-1">
                                                                            <h6 className="mb-1 font-weight-bold" style={{ fontSize: '13px', color: '#323130' }}>
                                                                                {enrollment.course.name}
                                                                            </h6>
                                                                            <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                                                                                <i className="fas fa-tag mr-1"></i>
                                                                                {enrollment.course.acronym}
                                                                            </small>
                                                                        </div>
                                                                        <span className={`badge ${getStatusColor(enrollment.enrollment_status)}`} style={{ fontSize: '10px' }}>
                                                                            {enrollment.enrollment_status}
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    <div className="mb-2">
                                                                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                                                                            <i className="fas fa-calendar mr-1"></i>
                                                                            Enrolled: {formatDateToReadable(enrollment.enrolled_date)}
                                                                        </small>
                                                                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                                                                            <i className="fas fa-money-bill-wave mr-1"></i>
                                                                            Payment: <span className={`badge ${getPaymentStatusColor(enrollment.payment_status)}`} style={{ fontSize: '9px' }}>
                                                                                {enrollment.payment_status}
                                                                            </span>
                                                                        </small>
                                                                    </div>

                                                                    {enrollment.enrollment_status === 'ongoing' && (
                                                                        <div className="mb-2">
                                                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                                                <small className="text-muted" style={{ fontSize: '11px' }}>Progress</small>
                                                                                <small className="font-weight-bold text-primary" style={{ fontSize: '11px' }}>
                                                                                    {enrollment.progress}%
                                                                                </small>
                                                                            </div>
                                                                            <div className="progress" style={{ height: '6px', borderRadius: '3px' }}>
                                                                                <div 
                                                                                    className="progress-bar bg-primary" 
                                                                                    role="progressbar" 
                                                                                    style={{ width: `${enrollment.progress}%` }}
                                                                                ></div>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <div className="d-flex justify-content-between align-items-center">
                                                                        <span className="font-weight-bold text-success" style={{ fontSize: '12px' }}>
                                                                            ₱{enrollment.course.total_fee.toLocaleString()}
                                                                        </span>
                                                                        <button
                                                                            onClick={navigateToCourseList}
                                                                            className="btn btn-outline-primary btn-sm"
                                                                            style={{ fontSize: '10px', padding: '0.25rem 0.5rem' }}
                                                                        >
                                                                            View
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            }
        </>
    )
}

export default Dashboard;