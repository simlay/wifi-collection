import com.cra.figaro.library.compound.If
import com.github.tototoshi.csv.CSVReader
import java.io.File

object Hi {
  def main(args: Array[String]) = {
    val reader = CSVReader.open(new File("tables.csv"))

    println(reader.all())
    println("Hi!")
  }
}



