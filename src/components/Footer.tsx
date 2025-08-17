const Footer = () => {
  const currentYear = new Date().getFullYear()
  return (
    <footer className="bg-[#1e2939] py-10">
      <div className="mycon">
        <p className="text-gray-200 text-center text-xl font-[Chillax]">© {currentYear} All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
