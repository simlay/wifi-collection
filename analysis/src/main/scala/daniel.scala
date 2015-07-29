

import com.cra.figaro.language._
import com.cra.figaro.library.compound._
import com.cra.figaro.library.compound.DuoElement
import com.cra.figaro.algorithm.factored.beliefpropagation._
import com.cra.figaro.library.atomic.continuous._
import com.github.tototoshi.csv.CSVReader
import java.io.File
import com.cra.figaro.library.atomic.continuous.AtomicNormal
import com.cra.figaro.library.atomic.continuous.AtomicNormal

/*
class PositionOld(lat: Double, long: Double, acc: Double) {
  val positionMean : Element[List[Double]] = Constant(List(lat, long))
  val positionVariance = acc;
  val positionCovarianceMatrix = Constant(List(List(positionVariance, 0.0), List(0.0, positionVariance)))
  val positionDistribution = MultivariateNormal(positionMean, positionCovarianceMatrix)
}


class Transmitter2() {
  val position = new Position(1.0, 1.0, 1.0) 
}

class TransmitterData() {
  val level = -81.0
  val frequency = 2400
}

class ReceiverOld(pos: Position, tData: TransmitterData) {
  val position = pos
  val transmitterData = tData
  
   val distance = transmitterData.level * 2 // TODO SOME FUNCTION OF POWER LEVEL AND FREQUENCY
   val variance = 2.0 // TODO SOME FUNCTION OF WIFI ROUTERS INTERFERING ONE ANOTHER
   
  var distanceDistribution = Normal(Constant(distance), Constant(variance))
  
  //for ( i <- 1 to transmittersVisibleData.length ) {
   
    //distanceDistributions = distanceDistributions ::: List( Normal(Constant(distance), Constant(variance)) )
  //}
  
}



object Program {
  
  // TODO Specify which transmitter
  def getTransmitterProbabilityAtPosition(lat: Double, long: Double) = {
    
    // Sum up all probabilities from all receivers and that particular transmitter at desired location
    
    
    

  }  
  
  
  def main(args: Array[String]) = {
    println("Started.")
    val reader = CSVReader.open(new File("tables.csv"))
    println("Loaded data.")
    val data = reader.all()
    
    var receivers : List[Receiver] = List()
    
    val t = new Transmitter()
    
    
    /*val variance = 3.0
    val mean = List(1.0, 1.0)
    val position = MultivariateNormal(mean, List(List(variance, 0.0), List(0.0, variance)))
    */
    
    for (line <- data) {
      println(line)
      var r = new Receiver(
          new Position(line(2).toDouble, line(3).toDouble, line(4).toDouble),
          new TransmitterData()
          )
      receivers = receivers ::: List(r)

    }
    
    
    
    println("Done!")
    println(receivers.length)

  }
}
*/


