
export default function InputField({ label, value, placeholder, name, onChange }) {
    return (
      <label>
          {label}:
          <input type="text" value={value} placeholder={placeholder} name={name} onChange={onChange} />
      </label>
    );
  }