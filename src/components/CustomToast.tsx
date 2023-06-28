const CustomToast = ({ message }: { message: string }) => {
  return (
    <div className="  flex-1 px-4 py-2 rounded-md text-sm sm:whitespace-normal">
      {message}
    </div>
  );
};

export default CustomToast;
