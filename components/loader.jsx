export const Loader = ({ size, color, bcolor }) => {
    return (
        <div
            className="loader"
            style={{
                border: `2px solid ${color}`,
                borderTop: `2px solid ${bcolor}`,
                minWidth: size,
                maxWidth: size,
                maxHeight: size,
                minHeight: size,
            }}
        ></div>
    );
};
