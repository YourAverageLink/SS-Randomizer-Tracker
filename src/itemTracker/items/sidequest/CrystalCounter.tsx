type CrystalCounterProps = {
    current: string | number;
    fontSize: number;
};

const CrystalCounter = ({ current, fontSize }: CrystalCounterProps) => (
    <div style={{ fontSize, margin: 0 }}>
        {current}
    </div>
);

export default CrystalCounter;
