
import './styles/CouponButton.scss';

const CouponButton = ({ onClick, count = 1 }) => {
    return (
        <button
            type="button"
            className="coupon-button"
            onClick={onClick}
            aria-label={`Ver cupones disponibles: ${count}`}
            title="Ver cupones disponibles"
        >
            <span className="coupon-button__icon" aria-hidden="true">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M4 7.5A2.5 2.5 0 0 0 6.5 5H18a2 2 0 0 1 2 2v3a2.5 2.5 0 0 0 0 5v2a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 0 4 16.5v-9Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M12 7v2m0 2v2m0 2v2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeDasharray="0.5 1.5"
                    />
                    <path
                        d="m15 9-4 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>
            </span>

            <span className="coupon-button__label"></span>

            {count > 0 && (
                <span className="coupon-button__count" aria-hidden="true">
                    {count > 9 ? '9+' : count}
                </span>
            )}

            <span className="coupon-button__glow" aria-hidden="true" />
        </button>
    );
};

export default CouponButton;
