import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function ReviewSection() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Safe parse current user info for roles check
  const userString = localStorage.getItem('user');
  let currentUser = null;
  if (userString && userString !== 'undefined' && userString !== 'null') {
    try {
      currentUser = JSON.parse(userString);
    } catch (e) {
      console.error(e);
    }
  }

  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  const canDelete = currentUser && (currentUser.role === 'admin' || currentUser.role === 'seller');

  const fetchReviews = async () => {
    try {
      const res = await axios.get('/api/reviews');
      setReviews(res.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  useEffect(() => { 
    fetchReviews(); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/reviews', { customerName: name, rating, comment });
      setName('');
      setComment('');
      fetchReviews();
      Swal.fire({
        title: 'Thank you!',
        text: 'Your feedback has been saved successfully.',
        icon: 'success',
        confirmButtonColor: '#2d6a4f',
        background: '#fdfbf7'
      });
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to save your review. Please try again.',
        icon: 'error',
        confirmButtonColor: '#2d6a4f',
        background: '#fdfbf7'
      });
    }
  };

  const handleDeleteReview = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this customer review.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#2D5016',
      confirmButtonText: 'Yes, delete it!',
      background: '#FDF6E3'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/reviews/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire({
          title: 'Deleted!',
          text: 'Review has been deleted.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#FDF6E3',
          iconColor: '#2D5016'
        });
        fetchReviews();
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: err.response?.data?.message || 'Failed to delete review.',
          icon: 'error',
          confirmButtonColor: '#2D5016',
          background: '#FDF6E3'
        });
      }
    }
  };

  return (
    <div className="mt-5">
      <h2 className="fw-bold mb-4 text-start">Customer Experience Reviews</h2>
      <div className="row g-4 text-start">
        {/* Form Column */}
        <div className="col-12 col-lg-4">
          <div className="card p-4 border-0 shadow-sm bg-white" style={{ borderRadius: '20px', border: '1.5px solid var(--glass-border) !important' }}>
            <h4 className="fw-bold text-success mb-3">Leave a Review</h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input type="text" className="form-control" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold d-block">Rating:</label>
                <div className="star-rating mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star-input fs-2 me-1 ${star <= rating ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <textarea className="form-control" rows="3" placeholder="Write your review here..." value={comment} onChange={(e) => setComment(e.target.value)} required></textarea>
              </div>
              <button type="submit" className="btn btn-custom w-100 fw-bold">Submit Review</button>
            </form>
          </div>
        </div>

        {/* Reviews List Column */}
        <div className="col-12 col-lg-8">
          <div className="row g-3">
            {reviews.map(rev => (
              <div key={rev._id} className="col-12 col-md-6">
                <div className="card p-3 h-100 border-0 shadow-sm bg-white" style={{ borderRadius: '16px', border: '1px solid var(--glass-border) !important' }}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="fw-bold mb-1 text-success">{rev.customerName}</h6>
                      <div style={{ color: '#fbbf24' }}>
                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                      </div>
                    </div>
                    {canDelete && (
                      <button 
                        onClick={() => handleDeleteReview(rev._id)} 
                        className="btn btn-link text-danger p-0 border-0 text-decoration-none small fw-bold"
                        title="Delete Review"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                  <p className="text-muted small mb-0">"{rev.comment}"</p>
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-muted text-center py-4">No reviews yet. Share your experience!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewSection;